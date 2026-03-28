from django.urls import path
from .views import (
    ApplyJobView,
    MyApplicationsView,
    JobApplicantsView,
    UpdateApplicationStatusView,
    EmployerDashboardView
)

urlpatterns = [
    # Seeker
    path('apply/<int:job_id>/', ApplyJobView.as_view(), name='apply-job'),
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),

    # Employer
    path('job/<int:job_id>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),
    path('applications/<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
    path('employer/dashboard/', EmployerDashboardView.as_view(), name='employer-dashboard'),
]