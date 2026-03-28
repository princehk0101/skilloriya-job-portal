from django.urls import path
from .views import (
    SkillListView,
    SkillCreateView,
    SkillDetailView,
    SkillUpdateView,
    SkillDeleteView
)

urlpatterns = [

    path("", SkillListView.as_view(), name="skill-list"),

    path("create/", SkillCreateView.as_view(), name="skill-create"),

    path("<int:id>/", SkillDetailView.as_view(), name="skill-detail"),

    path("<int:id>/update/", SkillUpdateView.as_view(), name="skill-update"),

    path("<int:id>/delete/", SkillDeleteView.as_view(), name="skill-delete"),
]