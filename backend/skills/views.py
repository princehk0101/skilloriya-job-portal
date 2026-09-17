from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView
)

from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Skill
from .serializers import SkillSerializer


class SkillListView(ListAPIView):

    queryset = Skill.objects.all().order_by("name")
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]

    filter_backends = [SearchFilter, DjangoFilterBackend]

    search_fields = ["name", "category"]

    filterset_fields = ["category"]


class SkillCreateView(CreateAPIView):

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminUser]


class SkillDetailView(RetrieveAPIView):

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"


class SkillUpdateView(UpdateAPIView):

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"


class SkillDeleteView(DestroyAPIView):

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"