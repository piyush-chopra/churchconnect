import uuid
from pathlib import Path
from django.db import models
from django.conf import settings

def resume_path(instance, filename):
    return f'resumes/{instance.user_id}/{uuid.uuid4().hex}{Path(filename).suffix.lower()}'

class Profile(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='profile')
    role=models.CharField(max_length=12,choices=[('candidate','Candidate'),('employer','Employer')],default='candidate')
    organization=models.CharField(max_length=120,blank=True)

class Job(models.Model):
    owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,null=True,blank=True)
    title=models.CharField(max_length=120)
    church=models.CharField(max_length=120)
    location=models.CharField(max_length=120)
    category=models.CharField(max_length=50)
    employment_type=models.CharField(max_length=30,default='Full-time')
    work_mode=models.CharField(max_length=20,default='On-site')
    salary_min=models.PositiveIntegerField(default=0)
    salary_max=models.PositiveIntegerField(default=0)
    description=models.TextField()
    requirements=models.TextField()
    skills=models.JSONField(default=list)
    color=models.CharField(max_length=20,default='sage')
    is_active=models.BooleanField(default=True)
    is_demo=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering=['-created_at']

class Resume(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='resumes')
    file=models.FileField(upload_to=resume_path)
    original_name=models.CharField(max_length=255)
    extracted_text=models.TextField(blank=True)
    skills=models.JSONField(default=list)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering=['-created_at']

class SavedJob(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    job=models.ForeignKey(Job,on_delete=models.CASCADE)
    class Meta:
        constraints=[models.UniqueConstraint(fields=['user','job'],name='unique_saved_job')]

class Application(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    job=models.ForeignKey(Job,on_delete=models.CASCADE)
    resume=models.ForeignKey(Resume,on_delete=models.PROTECT)
    cover_note=models.TextField(blank=True)
    status=models.CharField(max_length=20,default='Submitted',choices=[(s,s) for s in ['Submitted','Reviewing','Interview','Not selected']])
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering=['-created_at']
        constraints=[models.UniqueConstraint(fields=['user','job'],name='unique_application')]
