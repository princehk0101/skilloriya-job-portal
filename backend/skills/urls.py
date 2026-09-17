from django.urls import path
from .views import (
    SkillListView,
    SkillCreateView,
    SkillDetailView,
    SkillUpdateView,
    SkillDeleteView
)
from .assessment_views import (
    AssessmentListView,
    AssessmentDetailView,
    SubmitAssessmentView,
    UserBadgesView,
)

urlpatterns = [

    path("", SkillListView.as_view(), name="skill-list"),

    path("create/", SkillCreateView.as_view(), name="skill-create"),

    path("<int:id>/", SkillDetailView.as_view(), name="skill-detail"),

    path("<int:id>/update/", SkillUpdateView.as_view(), name="skill-update"),

    path("<int:id>/delete/", SkillDeleteView.as_view(), name="skill-delete"),

    # Assessments
    path("assessments/", AssessmentListView.as_view(), name="assessment-list"),
    path("assessments/<int:pk>/", AssessmentDetailView.as_view(), name="assessment-detail"),
    path("assessments/<int:pk>/submit/", SubmitAssessmentView.as_view(), name="assessment-submit"),
    path("my-badges/", UserBadgesView.as_view(), name="user-badges"),
]