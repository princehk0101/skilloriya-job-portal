from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count

from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusSerializer
from .permissions import IsSeeker, IsEmployer
from jobs.models import Job


# Seeker Applies to Job

class ApplyJobView(APIView):

    permission_classes = [IsAuthenticated, IsSeeker]

    def post(self, request, job_id):

        job = get_object_or_404(Job, id=job_id, is_active=True)

        if Application.objects.filter(
                applicant=request.user,
                job=job
        ).exists():

            return Response(
                {"message": "You already applied to this job"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ApplicationSerializer(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        serializer.save(
            applicant=request.user,
            job=job
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyApplicationsView(ListAPIView):

    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsSeeker]

    def get_queryset(self):

        return Application.objects.filter(
            applicant=self.request.user
        ).select_related('job')


class JobApplicantsView(ListAPIView):

    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):

        job_id = self.kwargs['job_id']

        job = get_object_or_404(
            Job,
            id=job_id,
            employer=self.request.user
        )

        return Application.objects.filter(
            job=job
        ).select_related('applicant')



class UpdateApplicationStatusView(UpdateAPIView):

    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsAuthenticated, IsEmployer]
    http_method_names = ['put', 'patch']

    def get_queryset(self):

        return Application.objects.filter(
            job__employer=self.request.user
        )


class EmployerDashboardView(APIView):

    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):

        employer_jobs = Job.objects.filter(
            employer=request.user
        )

        applications = Application.objects.filter(
            job__in=employer_jobs
        )

        total = applications.count()

        waitlist = applications.filter(
            status=Application.Status.WAITLIST
        ).count()

        shortlisted = applications.filter(
            status=Application.Status.SHORTLISTED
        ).count()

        rejected = applications.filter(
            status=Application.Status.REJECTED
        ).count()

        accepted = applications.filter(
            status=Application.Status.ACCEPTED
        ).count()

        job_wise_stats = applications.values(
            'job__title'
        ).annotate(
            total_applications=Count('id')
        )

        recent_applications = applications.select_related(
            'job',
            'applicant'
        ).order_by('-applied_at')[:5]

        return Response({

            "total_applications": total,
            "waitlist": waitlist,
            "shortlisted": shortlisted,
            "rejected": rejected,
            "accepted": accepted,
            "applications_per_job": job_wise_stats,

            "recent_applications":
                ApplicationSerializer(
                    recent_applications,
                    many=True,
                    context={'request': request}
                ).data
        })
