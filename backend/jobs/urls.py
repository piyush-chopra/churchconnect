from django.urls import path
from . import views
urlpatterns=[path('session/',views.session),path('auth/register/',views.register),path('auth/login/',views.sign_in),path('auth/logout/',views.sign_out),path('jobs/',views.jobs),path('jobs/<int:pk>/',views.job_detail),path('jobs/<int:pk>/save/',views.save_job),path('resumes/',views.resumes),path('resumes/<int:pk>/download/',views.resume_download),path('applications/',views.applications),path('applications/<int:pk>/',views.application_status)]
