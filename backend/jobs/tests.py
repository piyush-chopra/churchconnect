import io, json, tempfile
from pathlib import Path
from django.test import TestCase, Client, override_settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.cache import cache
from docx import Document
from .models import Profile, Job, Resume, Application
User=get_user_model()
class WorkflowTests(TestCase):
    def setUp(self):
        cache.clear()
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.override=override_settings(MEDIA_ROOT=self.temp.name);self.override.enable();self.addCleanup(self.override.disable)
        self.candidate=self.make_user('candidate@example.com','candidate')
        self.employer=self.make_user('employer@example.com','employer')
        self.other=self.make_user('other@example.com','employer')
        self.job=Job.objects.create(owner=self.employer,title='Youth Director',church='Example Church',location='Austin, TX',category='Youth & Children',description='Lead youth programs',requirements='Teaching experience',skills=['Teaching','Youth ministry'])
    def make_user(self,email,role):
        u=User.objects.create_user(email,email,'StrongPassword_487!',first_name=role.title());Profile.objects.create(user=u,role=role,organization='Example Church' if role=='employer' else '');return u
    def post(self,url,data):return self.client.post(url,json.dumps(data),content_type='application/json')
    def upload(self):
        self.client.force_login(self.candidate)
        return self.client.post('/api/resumes/',{'file':SimpleUploadedFile('resume.txt',b'An experienced teacher in youth ministry. Leadership, teaching and volunteer management.',content_type='text/plain')})
    def test_public_job_search_and_filters(self):
        self.assertEqual(self.client.get('/api/jobs/?q=youth').json()['jobs'][0]['id'],self.job.id)
        self.assertEqual(self.client.get('/api/jobs/?work_mode=Remote').json()['jobs'],[])
    def test_registration_login_logout_and_password_validation(self):
        self.assertEqual(self.post('/api/auth/register/',{'name':'Alex','email':'new@example.com','password':'1234'}).status_code,400)
        r=self.post('/api/auth/register/',{'name':'Alex','email':'new@example.com','password':'A_realStrongPassword234!','role':'candidate'})
        self.assertEqual(r.status_code,201);self.assertEqual(r.json()['user']['role'],'candidate')
        self.assertEqual(self.client.get('/api/session/').json()['user']['email'],'new@example.com')
        self.post('/api/auth/logout/',{})
        self.assertIsNone(self.client.get('/api/session/').json()['user'])
        self.assertEqual(self.post('/api/auth/login/',{'email':'new@example.com','password':'wrong'}).status_code,401)
        self.assertEqual(self.post('/api/auth/login/',{'email':'new@example.com','password':'A_realStrongPassword234!'}).status_code,200)
    def test_csrf_required_for_registration_and_upload(self):
        c=Client(enforce_csrf_checks=True)
        self.assertEqual(c.post('/api/auth/register/',{},content_type='application/json').status_code,403)
        d=c.get('/api/session/').json();self.assertTrue(d['csrfToken'])
        c.force_login(self.candidate)
        self.assertEqual(c.post('/api/resumes/',{'file':SimpleUploadedFile('resume.txt',b'hello world experience')}).status_code,403)
    def test_resume_upload_and_transparent_matching(self):
        response=self.upload();self.assertEqual(response.status_code,201)
        self.assertIn('Teaching',response.json()['resume']['skills'])
        job=self.client.get('/api/jobs/?sort=match').json()['jobs'][0]
        self.assertEqual(job['match_score'],100);self.assertEqual(len(job['matched_skills']),2)
    def test_invalid_oversize_and_unreadable_files(self):
        self.client.force_login(self.candidate)
        for name,data in [('malware.exe',b'not a resume'),('fake.pdf',b'not a real pdf'),('empty.txt',b''),('large.txt',b'a'*(5*1024*1024+1)),('old.doc',b'legacy format')]:
            with self.subTest(name=name):self.assertEqual(self.client.post('/api/resumes/',{'file':SimpleUploadedFile(name,data)}).status_code,400)
    def test_docx_extraction(self):
        self.client.force_login(self.candidate)
        stream=io.BytesIO();doc=Document();doc.add_paragraph('Leadership and teaching with a focus on youth ministry.');doc.save(stream)
        response=self.client.post('/api/resumes/',{'file':SimpleUploadedFile('resume.docx',stream.getvalue())})
        self.assertEqual(response.status_code,201);self.assertIn('Leadership',response.json()['resume']['skills'])
    def test_resume_private_except_applied_employer(self):
        self.upload();resume=Resume.objects.get();url=f'/api/resumes/{resume.id}/download/'
        self.assertEqual(self.client.get(url).status_code,200)
        self.client.logout();self.assertEqual(self.client.get(url).status_code,401)
        self.client.force_login(self.employer);self.assertEqual(self.client.get(url).status_code,403)
        Application.objects.create(user=self.candidate,job=self.job,resume=resume)
        self.assertEqual(self.client.get(url).status_code,200)
        self.client.force_login(self.other);self.assertEqual(self.client.get(url).status_code,403)
    def test_application_requires_resume_and_prevents_duplicates(self):
        self.client.force_login(self.candidate)
        self.assertEqual(self.post('/api/applications/',{'job_id':self.job.id}).status_code,400)
        self.upload()
        self.assertEqual(self.post('/api/applications/',{'job_id':self.job.id}).status_code,201)
        self.assertEqual(self.post('/api/applications/',{'job_id':self.job.id}).status_code,409)
    def test_replacement_keeps_application_resume_snapshot(self):
        self.upload();self.post('/api/applications/',{'job_id':self.job.id});old=Application.objects.get().resume_id
        self.upload();self.assertNotEqual(Resume.objects.first().id,old);self.assertEqual(Application.objects.get().resume_id,old)
    def test_role_restrictions_and_owner_status(self):
        self.upload();self.post('/api/applications/',{'job_id':self.job.id});a=Application.objects.get()
        url=f'/api/applications/{a.id}/'
        self.assertEqual(self.client.patch(url,json.dumps({'status':'Interview'}),content_type='application/json').status_code,403)
        self.client.force_login(self.other)
        self.assertEqual(self.client.patch(url,json.dumps({'status':'Interview'}),content_type='application/json').status_code,404)
        self.client.force_login(self.employer)
        self.assertEqual(self.client.patch(url,json.dumps({'status':'Interview'}),content_type='application/json').status_code,200)
        self.assertEqual(self.client.get('/api/applications/').json()['applications'][0]['status'],'Interview')
        self.assertEqual(self.client.post('/api/resumes/',{}).status_code,403)
    def test_employer_post_and_close_job(self):
        data={'title':'Music Director','location':'Remote','category':'Worship & Music','type':'Full-time','work_mode':'Remote','description':'Lead our music team.','requirements':'Music experience.','skills':['Worship'],'salary_min':40000,'salary_max':60000}
        self.client.force_login(self.candidate);self.assertEqual(self.post('/api/jobs/',data).status_code,403)
        self.client.force_login(self.employer);r=self.post('/api/jobs/',data);self.assertEqual(r.status_code,201)
        pk=r.json()['job']['id'];self.assertFalse(r.json()['job']['is_demo'])
        self.client.patch(f'/api/jobs/{pk}/',json.dumps({'is_active':False}),content_type='application/json')
        self.client.force_login(self.candidate);self.assertEqual(self.post('/api/applications/',{'job_id':pk}).status_code,404)
    def test_save_unsave_is_idempotent(self):
        self.client.force_login(self.candidate)
        url=f'/api/jobs/{self.job.id}/save/'
        self.post(url,{'saved':True});self.post(url,{'saved':True})
        self.assertEqual(self.client.get('/api/jobs/').json()['saved'],[self.job.id])
        self.post(url,{'saved':False});self.assertEqual(self.client.get('/api/jobs/').json()['saved'],[])
    def test_malformed_payloads_return_client_errors(self):
        for raw in ['[]','broken','null']:
            self.assertEqual(self.client.post('/api/auth/register/',raw,content_type='application/json').status_code,400)
