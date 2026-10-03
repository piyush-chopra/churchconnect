from django.contrib import admin
from .models import Profile, Job, Resume, Application, SavedJob
admin.site.register([Profile,Job,Resume,Application,SavedJob])
