from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Job, JobCategory, SavedJob, JobAlert
from .serializers import JobSerializer, JobCategorySerializer, SavedJobSerializer, JobAlertSerializer
from .permissions import IsEmployer, IsSeeker
from .alerts import alert_matches_job, notify_matching_job_alerts


# Job List (Search + Filter + Ordering)

class JobListView(ListAPIView):

    queryset = Job.objects.filter(is_active=True).select_related('employer', 'category').order_by("-created_at")
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter
    ]

    filterset_fields = {
        "employer": ["exact"],
        "location": ["exact", "icontains"],
        "salary": ["gte", "lte"],
        "experience_required": ["gte"],
        "job_type": ["exact"],
        "category": ["exact"],
    }

    search_fields = [
        "title",
        "description",
        "location"
    ]

    ordering_fields = [
        "salary",
        "created_at"
    ]


class MyJobsListView(ListAPIView):

    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Job.objects.filter(
            employer=self.request.user,
            is_active=True
        ).order_by("-created_at")



# Create Job (Employer Only)
class JobCreateView(CreateAPIView):

    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if not self.request.user.is_approved_by_admin and not self.request.user.is_staff:
            raise PermissionDenied("Your recruiter account is pending admin approval. You cannot post jobs yet.")
        job = serializer.save(employer=self.request.user)
        notify_matching_job_alerts(job)



class JobDetailView(RetrieveAPIView):

    queryset = Job.objects.filter(is_active=True)
    serializer_class = JobSerializer
    permission_classes = [AllowAny]



class JobUpdateView(UpdateAPIView):

    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Job.objects.filter(
            employer=self.request.user,
            is_active=True
        )



class JobDeleteView(DestroyAPIView):

    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Job.objects.filter(
            employer=self.request.user
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class JobCategoryListView(ListAPIView):

    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [AllowAny]


class SavedJobListView(ListAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).select_related('job', 'job__employer')


class SavedJobToggleView(APIView):
    permission_classes = [IsAuthenticated, IsSeeker]

    def post(self, request, job_id):
        job = get_object_or_404(Job, id=job_id, is_active=True)
        saved, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        if not created:
            saved.delete()
        return Response({'saved': created}, status=status.HTTP_200_OK)


class JobAlertListCreateView(ListAPIView):
    serializer_class = JobAlertSerializer
    permission_classes = [IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return JobAlert.objects.filter(user=self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class JobAlertDetailView(RetrieveAPIView, UpdateAPIView, DestroyAPIView):
    serializer_class = JobAlertSerializer
    permission_classes = [IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return JobAlert.objects.filter(user=self.request.user)


class JobAlertMatchesView(ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsSeeker]

    def get_queryset(self):
        alert = get_object_or_404(JobAlert, id=self.kwargs['pk'], user=self.request.user, is_active=True)
        queryset = Job.objects.filter(is_active=True)
        if alert.keyword:
            queryset = queryset.filter(Q(title__icontains=alert.keyword) | Q(description__icontains=alert.keyword))
        if alert.location:
            queryset = queryset.filter(location__icontains=alert.location)
        if alert.job_type:
            queryset = queryset.filter(job_type=alert.job_type)
        if alert.min_salary is not None:
            queryset = queryset.filter(salary__gte=alert.min_salary)
        if alert.max_salary is not None:
            queryset = queryset.filter(salary__lte=alert.max_salary)
        if alert.experience_required is not None:
            queryset = queryset.filter(experience_required__lte=alert.experience_required)
        return [job for job in queryset.select_related('employer', 'category').order_by('-created_at') if alert_matches_job(alert, job)]
