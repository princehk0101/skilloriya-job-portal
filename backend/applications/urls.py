from django.urls import path
from .views import (
    ApplyJobView,
    MyApplicationsView,
    JobApplicantsView,
    UpdateApplicationStatusView,
    EmployerDashboardView,
    ScheduleInterviewView,
    MyInterviewsView,
    InterviewDetailView,
    InterviewFeedbackView,
    InterviewNotesView,
    ReviewSkillProofView,
)

urlpatterns = [
    # Seeker
    path('apply/<int:job_id>/', ApplyJobView.as_view(), name='apply-job'),
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),

    # Employer
    path('job/<int:job_id>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),
    path('applications/<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
    path('applications/<int:application_id>/skill-proof/review/', ReviewSkillProofView.as_view(), name='review-skill-proof'),
    path('employer/dashboard/', EmployerDashboardView.as_view(), name='employer-dashboard'),

    # Video Interviews
    path('applications/<int:application_id>/schedule-interview/', ScheduleInterviewView.as_view(), name='schedule-interview'),
    path('interviews/my/', MyInterviewsView.as_view(), name='my-interviews'),
    path('interviews/<str:room_id>/', InterviewDetailView.as_view(), name='interview-detail'),
    path('interviews/<int:interview_id>/feedback/', InterviewFeedbackView.as_view(), name='interview-feedback'),
    path('interviews/<str:room_id>/notes/', InterviewNotesView.as_view(), name='interview-notes'),
]