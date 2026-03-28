from rest_framework import serializers
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import DestroyAPIView, ListAPIView, UpdateAPIView
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.models import Application
from applications.serializers import ApplicationSerializer, ApplicationStatusSerializer
from companies.models import Company
from companies.serializers import CompanySerializer
from jobs.models import Job
from jobs.serializers import JobSerializer
from users.models import User


class IsPlatformAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "role",
            "is_verified",
            "is_active",
            "is_staff",
            "is_superuser",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "location",
            "company_name",
            "date_joined",
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.email


class AdminUserManageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["role", "is_verified", "is_active", "is_staff"]


class AdminJobManageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "title",
            "location",
            "salary",
            "job_type",
            "experience_required",
            "category",
            "is_active",
        ]


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        users = User.objects.all()
        jobs = Job.objects.select_related("employer", "category").all()
        companies = Company.objects.select_related("owner").all()
        applications = Application.objects.select_related("applicant", "job").all()

        return Response({
            "stats": {
                "total_users": users.count(),
                "seekers": users.filter(role="seeker").count(),
                "employers": users.filter(role="employer").count(),
                "verified_users": users.filter(is_verified=True).count(),
                "active_jobs": jobs.filter(is_active=True).count(),
                "total_jobs": jobs.count(),
                "companies": companies.count(),
                "applications": applications.count(),
            },
            "recent_users": AdminUserSerializer(users.order_by("-date_joined")[:5], many=True).data,
            "recent_jobs": JobSerializer(jobs.order_by("-created_at")[:5], many=True, context={"request": request}).data,
            "recent_applications": ApplicationSerializer(
                applications.order_by("-applied_at")[:5],
                many=True,
                context={"request": request},
            ).data,
        })


class AdminUserListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = AdminUserSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["email", "first_name", "last_name", "phone_number", "company_name"]
    ordering_fields = ["date_joined", "email"]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")


class AdminUserUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = AdminUserManageSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return User.objects.all()


class AdminJobListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = JobSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "employer__email", "location", "description"]
    ordering_fields = ["created_at", "salary"]

    def get_queryset(self):
        return Job.objects.select_related("employer", "category").all().order_by("-created_at")


class AdminJobUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = AdminJobManageSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return Job.objects.all()


class AdminCompanyListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = CompanySerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "owner__email", "location", "description"]
    ordering_fields = ["created_at", "name"]

    def get_queryset(self):
        return Company.objects.select_related("owner").all().order_by("-created_at")


class AdminCompanyDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get_queryset(self):
        return Company.objects.all()


class AdminApplicationListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = ApplicationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["full_name", "applicant__email", "job__title", "college_name", "skills"]
    ordering_fields = ["applied_at", "status"]

    def get_queryset(self):
        return Application.objects.select_related("applicant", "job").all().order_by("-applied_at")


class AdminApplicationUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = ApplicationStatusSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return Application.objects.all()
