from django.urls import path

from .admin_views import (
    AdminDashboardView,
    AdminUserListView,
    AdminUserUpdateView,
    AdminJobListView,
    AdminJobCreateView,
    AdminJobUpdateView,
    AdminJobDeleteView,
    AdminCompanyListView,
    AdminCompanyCreateView,
    AdminCompanyUpdateView,
    AdminCompanyDeleteView,
    AdminApplicationListView,
    AdminApplicationUpdateView,
)


urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("jobs/", AdminJobListView.as_view(), name="admin-jobs"),
    path("jobs/create/", AdminJobCreateView.as_view(), name="admin-job-create"),
    path("jobs/<int:pk>/", AdminJobUpdateView.as_view(), name="admin-job-update"),
    path("jobs/<int:pk>/delete/", AdminJobDeleteView.as_view(), name="admin-job-delete"),
    path("companies/", AdminCompanyListView.as_view(), name="admin-companies"),
    path("companies/create/", AdminCompanyCreateView.as_view(), name="admin-company-create"),
    path("companies/<int:pk>/", AdminCompanyUpdateView.as_view(), name="admin-company-update"),
    path("companies/<int:pk>/delete/", AdminCompanyDeleteView.as_view(), name="admin-company-delete"),
    path("applications/", AdminApplicationListView.as_view(), name="admin-applications"),
    path("applications/<int:pk>/", AdminApplicationUpdateView.as_view(), name="admin-application-update"),
]
