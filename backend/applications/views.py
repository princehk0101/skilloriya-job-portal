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

        applied = applications.filter(status=Application.Status.APPLIED).count()
        screening = applications.filter(status=Application.Status.SCREENING).count()
        interview = applications.filter(status=Application.Status.INTERVIEW).count()
        offer = applications.filter(status=Application.Status.OFFER).count()

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
            "applied": applied,
            "screening": screening,
            "interview": interview,
            "offer": offer,
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


import uuid
from .models import VideoInterview
from .serializers import VideoInterviewSerializer


class ScheduleInterviewView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def post(self, request, application_id):
        application = get_object_or_404(Application, id=application_id, job__employer=request.user)
        scheduled_at = request.data.get('scheduled_at')
        notes = request.data.get('notes', '')

        if not scheduled_at:
            return Response({'error': 'scheduled_at datetime is required.'}, status=status.HTTP_400_BAD_REQUEST)

        room_id = f"skilloria-{uuid.uuid4().hex[:10]}"

        interview = VideoInterview.objects.create(
            application=application,
            employer=request.user,
            candidate=application.applicant,
            room_id=room_id,
            scheduled_at=scheduled_at,
            notes=notes,
            status='scheduled'
        )

        # Update application status to INTERVIEW if not already advanced
        if application.status in [Application.Status.APPLIED, Application.Status.WAITLIST, Application.Status.SCREENING]:
            application.status = Application.Status.INTERVIEW
            application.save(update_fields=['status'])

        serializer = VideoInterviewSerializer(interview)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyInterviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'employer' or user.is_staff or user.is_superuser:
            interviews = VideoInterview.objects.filter(employer=user).select_related('application', 'candidate', 'application__job')
        else:
            interviews = VideoInterview.objects.filter(candidate=user).select_related('application', 'employer', 'application__job')

        serializer = VideoInterviewSerializer(interviews, many=True)
        return Response(serializer.data)


class InterviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        interview = get_object_or_404(VideoInterview, room_id=room_id)
        # Check permissions: only employer, candidate or admin
        if request.user not in [interview.employer, interview.candidate] and not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'You are not authorized to join this interview.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = VideoInterviewSerializer(interview)
        return Response(serializer.data)

