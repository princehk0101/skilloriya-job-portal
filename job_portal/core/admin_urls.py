from django.urls import path

from .admin_views import (
    AdminDashboardView,
    AdminUserListView,
    AdminUserUpdateView,
    AdminJobListView,
    AdminJobUpdateView,
    AdminCompanyListView,
    AdminCompanyDeleteView,
    AdminApplicationListView,
    AdminApplicationUpdateView,
)


urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("jobs/", AdminJobListView.as_view(), name="admin-jobs"),
    path("jobs/<int:pk>/", AdminJobUpdateView.as_view(), name="admin-job-update"),
    path("companies/", AdminCompanyListView.as_view(), name="admin-companies"),
    path("companies/<int:pk>/", AdminCompanyDeleteView.as_view(), name="admin-company-delete"),
    path("applications/", AdminApplicationListView.as_view(), name="admin-applications"),
    path("applications/<int:pk>/", AdminApplicationUpdateView.as_view(), name="admin-application-update"),
]
