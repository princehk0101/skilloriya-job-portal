from django.urls import path
from .views import (
    JobListView,
    MyJobsListView,
    JobCreateView,
    JobDetailView,
    JobUpdateView,
    JobDeleteView,
    JobCategoryListView 
)

urlpatterns = [

    # Jobs
    path('', JobListView.as_view(), name='job-list'),
    path('my-jobs/', MyJobsListView.as_view(), name='my-jobs'),
    path('create/', JobCreateView.as_view(), name='job-create'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('<int:pk>/update/', JobUpdateView.as_view(), name='job-update'),
    path('<int:pk>/delete/', JobDeleteView.as_view(), name='job-delete'),
    path('categories/', JobCategoryListView.as_view(), name='job-categories'),
]
