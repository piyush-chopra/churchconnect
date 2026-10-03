import json
from functools import wraps
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.http import JsonResponse, FileResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from .models import Profile, Job, Resume, SavedJob, Application
from .services import parse_resume, SKILLS
User=get_user_model()
CATEGORIES=['Pastoral','Worship & Music','Youth & Children','Operations','Outreach','Media & Creative']

def error(message,status=400): return JsonResponse({'error':message},status=status)
def body(request):
    try:
        data=json.loads(request.body or '{}')
        if not isinstance(data,dict): raise ValueError()
        return data
    except (ValueError,UnicodeDecodeError): raise ValidationError('Send a valid JSON object.')
def endpoint(methods,role=None):
    def decorator(fn):
        @require_http_methods(methods)
        @wraps(fn)
        def wrapped(request,*args,**kwargs):
            if role:
                if not request.user.is_authenticated: return error('Please sign in to continue.',401)
                if role!='any' and request.user.profile.role!=role: return error('This action is not available for your account type.',403)
            try: return fn(request,*args,**kwargs)
            except ValidationError as e: return error(' '.join(e.messages))
            except (TypeError,ValueError,KeyError): return error('Some fields are missing or invalid. Please check your entries.')
        return wrapped
    return decorator

def user_data(user):
    if not user.is_authenticated: return None
    return {'id':user.id,'name':user.first_name,'email':user.email,'role':user.profile.role,'organization':user.profile.organization}
def resume_data(resume):
    return {'id':resume.id,'name':resume.original_name,'skills':resume.skills,'created_at':resume.created_at.isoformat()} if resume else None

def job_data(job,user=None,resume=None):
    matched=[s for s in job.skills if resume and s in resume.skills]
    return {'id':job.id,'title':job.title,'church':job.church,'location':job.location,'category':job.category,'type':job.employment_type,'work_mode':job.work_mode,'salary_min':job.salary_min,'salary_max':job.salary_max,'description':job.description,'requirements':job.requirements,'skills':job.skills,'color':job.color,'is_demo':job.is_demo,'is_active':job.is_active,'created_at':job.created_at.isoformat(),'matched_skills':matched,'match_score':round(100*len(matched)/len(job.skills)) if resume and job.skills else None}

@endpoint(['GET'])
def session(request):
    return JsonResponse({'user':user_data(request.user),'csrfToken':get_token(request),'categories':CATEGORIES})

def check_rate(request):
    key='auth:'+request.META.get('REMOTE_ADDR','unknown')
    n=cache.get(key,0)
    if n>=20: raise ValidationError('Too many attempts. Please try again in a minute.')
    cache.set(key,n+1,60)

@endpoint(['POST'])
def register(request):
    check_rate(request)
    data=body(request)
    email=str(data.get('email','')).strip().lower()
    name=str(data.get('name','')).strip()
    role=data.get('role','candidate')
    organization=str(data.get('organization','')).strip()
    password=data.get('password','')
    validate_email(email)
    if len(email)>150 or not name or len(name)>150 or role not in ['candidate','employer'] or len(organization)>120: raise ValidationError('Enter a valid name, email and account type.')
    if role=='employer' and not organization: raise ValidationError('Enter your church or organization name.')
    user=User(username=email,email=email,first_name=name)
    validate_password(password,user)
    try:
        with transaction.atomic():
            user.set_password(password);user.save()
            Profile.objects.create(user=user,role=role,organization=organization)
    except IntegrityError: return error('An account with this email already exists. Please sign in.',409)
    login(request,user)
    return JsonResponse({'user':user_data(user),'csrfToken':get_token(request)},status=201)

@endpoint(['POST'])
def sign_in(request):
    check_rate(request)
    data=body(request)
    user=authenticate(request,username=str(data.get('email','')).strip().lower(),password=data.get('password',''))
    if not user: return error('Email or password is incorrect.',401)
    Profile.objects.get_or_create(user=user)
    login(request,user)
    return JsonResponse({'user':user_data(user),'csrfToken':get_token(request)})

@endpoint(['POST'],'any')
def sign_out(request):
    logout(request)
    return JsonResponse({'user':None,'csrfToken':get_token(request)})

@endpoint(['GET','POST'])
def jobs(request):
    if request.method=='POST':
        if not request.user.is_authenticated: return error('Please sign in.',401)
        if request.user.profile.role!='employer': return error('An employer account is required.',403)
        d=body(request)
        for field in ['title','location','description','requirements']:
            if not isinstance(d.get(field),str) or not d[field].strip(): raise ValidationError('Complete the job title, location, description and requirements.')
        if len(d['title'])>120 or len(d['location'])>120 or len(d['description'])>12000 or len(d['requirements'])>8000: raise ValidationError('One of your fields is too long.')
        if d.get('category') not in CATEGORIES or d.get('type') not in ['Full-time','Part-time','Contract','Volunteer'] or d.get('work_mode') not in ['On-site','Hybrid','Remote']: raise ValidationError('Choose a valid category, job type and work arrangement.')
        low=int(d.get('salary_min') or 0);high=int(d.get('salary_max') or 0)
        if not 0<=low<=high<=1000000: raise ValidationError('Enter a valid annual salary range, with the minimum first.')
        skills=d.get('skills',[])
        if not isinstance(skills,list) or any(s not in SKILLS for s in skills): raise ValidationError('Choose skills from the available list.')
        job=Job.objects.create(owner=request.user,title=d['title'].strip(),church=request.user.profile.organization,location=d['location'].strip(),category=d['category'],employment_type=d['type'],work_mode=d['work_mode'],salary_min=low,salary_max=high,description=d['description'],requirements=d['requirements'],skills=skills)
        return JsonResponse({'job':job_data(job)},status=201)
    qs=Job.objects.filter(is_active=True)
    query=request.GET.get('q','').strip()[:150]
    if query: qs=qs.filter(Q(title__icontains=query)|Q(church__icontains=query)|Q(description__icontains=query)|Q(skills__icontains=query))
    for key,field in [('location','location'),('category','category'),('type','employment_type'),('work_mode','work_mode')]:
        value=request.GET.get(key,'')
        if value: qs=qs.filter(**{field+'__icontains':value})
    authenticated=request.user.is_authenticated
    if request.GET.get('mine')=='1':
        if not authenticated: return error('Please sign in.',401)
        qs=Job.objects.filter(owner=request.user)
    resume=Resume.objects.filter(user=request.user).first() if authenticated else None
    result=[job_data(j,request.user,resume) for j in qs]
    if request.GET.get('sort')=='match': result.sort(key=lambda j:j['match_score'] or 0,reverse=True)
    elif request.GET.get('sort')=='salary': result.sort(key=lambda j:j['salary_max'],reverse=True)
    saved=list(SavedJob.objects.filter(user=request.user).values_list('job_id',flat=True)) if authenticated else []
    applied=list(Application.objects.filter(user=request.user).values_list('job_id',flat=True)) if authenticated else []
    return JsonResponse({'jobs':result,'saved':saved,'applied':applied,'resume':resume_data(resume)})

@endpoint(['GET','PATCH'])
def job_detail(request,pk):
    job=get_object_or_404(Job,pk=pk)
    if request.method=='PATCH':
        if not request.user.is_authenticated or job.owner_id!=request.user.id: return error('Only the job owner can update this listing.',403)
        data=body(request)
        if not isinstance(data.get('is_active'),bool): raise ValidationError('Supply an open or closed status.')
        job.is_active=data['is_active'];job.save(update_fields=['is_active'])
    elif not job.is_active and (not request.user.is_authenticated or job.owner_id!=request.user.id):
        return error('This position is no longer open.',404)
    return JsonResponse({'job':job_data(job)})

@endpoint(['GET','POST'],'candidate')
def resumes(request):
    if request.method=='GET': return JsonResponse({'resume':resume_data(Resume.objects.filter(user=request.user).first())})
    upload=request.FILES.get('file')
    if not upload: raise ValidationError('Choose a résumé file to upload.')
    if Resume.objects.filter(user=request.user).count()>=50: raise ValidationError('You have reached the résumé upload limit. Contact your administrator.')
    text,skills=parse_resume(upload)
    resume=Resume.objects.create(user=request.user,file=upload,original_name=upload.name[:255],extracted_text=text,skills=skills)
    return JsonResponse({'resume':resume_data(resume),'message':'Résumé uploaded. Matches use the skills found in your document.'},status=201)

@endpoint(['GET'],'any')
def resume_download(request,pk):
    resume=get_object_or_404(Resume,pk=pk)
    allowed=resume.user_id==request.user.id or Application.objects.filter(resume=resume,job__owner=request.user).exists()
    if not allowed: return error('You do not have access to this résumé.',403)
    response=FileResponse(resume.file.open('rb'),as_attachment=True,filename=resume.original_name)
    response['Cache-Control']='private, no-store'
    return response

@endpoint(['POST'],'candidate')
def save_job(request,pk):
    job=get_object_or_404(Job,pk=pk)
    data=body(request)
    if not isinstance(data.get('saved'),bool): raise ValidationError('Supply a saved state.')
    if data['saved']: SavedJob.objects.get_or_create(user=request.user,job=job)
    else: SavedJob.objects.filter(user=request.user,job=job).delete()
    return JsonResponse({'saved':data['saved']})

@endpoint(['GET','POST'],'any')
def applications(request):
    if request.method=='POST':
        if request.user.profile.role!='candidate': return error('Use a candidate account to apply.',403)
        d=body(request)
        job=get_object_or_404(Job,pk=d.get('job_id'),is_active=True)
        resume=Resume.objects.filter(user=request.user).first()
        if not resume: raise ValidationError('Upload your résumé before applying.')
        note=str(d.get('cover_note',''))
        if len(note)>5000: raise ValidationError('Keep your note under 5,000 characters.')
        try:
            with transaction.atomic(): application=Application.objects.create(user=request.user,job=job,resume=resume,cover_note=note)
        except IntegrityError: return error('You have already applied for this position.',409)
        return JsonResponse({'id':application.id,'status':application.status},status=201)
    qs=Application.objects.filter(job__owner=request.user) if request.user.profile.role=='employer' else Application.objects.filter(user=request.user)
    data=[{'id':a.id,'job':job_data(a.job),'candidate':{'name':a.user.first_name,'email':a.user.email},'resume':resume_data(a.resume),'cover_note':a.cover_note,'status':a.status,'created_at':a.created_at.isoformat()} for a in qs.select_related('job','user','resume')]
    return JsonResponse({'applications':data})

@endpoint(['PATCH'],'employer')
def application_status(request,pk):
    application=get_object_or_404(Application,pk=pk,job__owner=request.user)
    status=body(request).get('status')
    if status not in ['Submitted','Reviewing','Interview','Not selected']: raise ValidationError('Choose a valid application status.')
    application.status=status;application.save(update_fields=['status'])
    return JsonResponse({'status':status})
