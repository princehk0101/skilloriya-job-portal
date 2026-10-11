from django.urls import path
from .ai_views import (
    AIResumeParserView,
    JobMatchScoreView,
    AIRecommendedJobsView,
    AIPortfolioBuilderView,
    AICoverLetterView,
    AIMockInterviewView,
    AISkillGapRoadmapView,
    AIAgenticCopilotView,
)

urlpatterns = [
    path('resume-parser/', AIResumeParserView.as_view(), name='ai-resume-parser'),
    path('job-match/<int:job_id>/', JobMatchScoreView.as_view(), name='ai-job-match'),
    path('recommended-jobs/', AIRecommendedJobsView.as_view(), name='ai-recommended-jobs'),
    path('portfolio-build/', AIPortfolioBuilderView.as_view(), name='ai-portfolio-build'),
    path('cover-letter/', AICoverLetterView.as_view(), name='ai-cover-letter'),
    path('mock-interview/', AIMockInterviewView.as_view(), name='ai-mock-interview'),
    path('skill-gap/', AISkillGapRoadmapView.as_view(), name='ai-skill-gap'),
    path('agentic-copilot/', AIAgenticCopilotView.as_view(), name='ai-agentic-copilot'),
]
