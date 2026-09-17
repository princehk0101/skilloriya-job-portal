from django.urls import path
from .ai_views import (
    AIResumeParserView,
    JobMatchScoreView,
    AIRecommendedJobsView,
)

urlpatterns = [
    path('resume-parser/', AIResumeParserView.as_view(), name='ai-resume-parser'),
    path('job-match/<int:job_id>/', JobMatchScoreView.as_view(), name='ai-job-match'),
    path('recommended-jobs/', AIRecommendedJobsView.as_view(), name='ai-recommended-jobs'),
]
