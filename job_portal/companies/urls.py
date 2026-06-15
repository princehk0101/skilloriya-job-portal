from django.urls import path

from .views import (
    CompanyCreateView,
    CompanyListView,
    CompanyDetailView,
    CompanyUpdateView,
    CompanyDeleteView
)
from .views import (
    MicrotaskCreateView,
    MicrotaskListView,
    MicrotaskDetailView,
    MicrotaskUpdateView,
    MicrotaskDeleteView,
)


urlpatterns = [

    path('', CompanyListView.as_view()),

    path('create/', CompanyCreateView.as_view()),

    path('<int:pk>/', CompanyDetailView.as_view()),

    path('<int:pk>/update/', CompanyUpdateView.as_view()),

    path('<int:pk>/delete/', CompanyDeleteView.as_view()),
    # Microtasks
    path('microtasks/', MicrotaskListView.as_view()),
    path('microtasks/create/', MicrotaskCreateView.as_view()),
    path('microtasks/<int:pk>/', MicrotaskDetailView.as_view()),
    path('microtasks/<int:pk>/update/', MicrotaskUpdateView.as_view()),
    path('microtasks/<int:pk>/delete/', MicrotaskDeleteView.as_view()),

]