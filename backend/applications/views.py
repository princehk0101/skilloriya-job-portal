from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.db import transaction
from django.utils import timezone

from .models import Application, ApplicationStatusEvent, InterviewFeedback, SkillProof
from .serializers import ApplicationSerializer, ApplicationStatusSerializer, InterviewFeedbackSerializer
from .permissions import IsSeeker, IsEmployer
from jobs.models import Job
from users.models import ResumeVersion
from .emails import send_application_confirmation


# Seeker Applies to Job

class ApplyJobView(APIView):

    permission_classes = [IsAuthenticated, IsSeeker]

    @transaction.atomic
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

        version_id = request.data.get('resume_version_id')
        resume_version = None
        if version_id:
            resume_version = get_object_or_404(ResumeVersion, id=version_id, user=request.user)

        proof_skills = request.data.get('proof_skills', '').strip()
        proof_url = request.data.get('proof_url', '').strip()
        proof_explanation = request.data.get('proof_explanation', '').strip()
        if any((proof_skills, proof_url, proof_explanation)) and (not proof_skills or not proof_explanation):
            return Response(
                {'skill_proof': 'Add the skills demonstrated and an explanation to submit a proof.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(proof_skills) > 500 or len(proof_explanation) > 5000:
            return Response({'skill_proof': 'Proof details are too long.'}, status=status.HTTP_400_BAD_REQUEST)
        if proof_url:
            from django.core.validators import URLValidator
            from django.core.exceptions import ValidationError
            try:
                URLValidator()(proof_url)
            except ValidationError:
                return Response({'proof_url': 'Enter a valid link to your work.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ApplicationSerializer(
            data=request.data,
            context={'request': request, 'resume_version': resume_version}
        )

        serializer.is_valid(raise_exception=True)

        application = serializer.save(
            applicant=request.user,
            job=job
        )
        if any((proof_skills, proof_url, proof_explanation)):
            SkillProof.objects.create(
                application=application,
                skills_demonstrated=proof_skills,
                artifact_url=proof_url,
                explanation=proof_explanation,
            )
        ApplicationStatusEvent.objects.create(
            application=application,
            from_status='',
            to_status=application.status,
            changed_by=request.user,
        )
        response = Response(
            {
                **serializer.data,
                'confirmation_email_sent': None,
                'message': 'Application submitted. Sending confirmation email.',
            },
            status=status.HTTP_201_CREATED,
        )

        def send_confirmation_after_commit():
            email_sent = send_application_confirmation(
                recipient=request.user.email,
                candidate_name=application.full_name,
                job_title=job.title,
                job_id=job.id,
                application_id=application.id,
            )
            response.data['confirmation_email_sent'] = email_sent
            response.data['message'] = (
                'Application submitted and confirmation email sent.'
                if email_sent
                else 'Application submitted, but the confirmation email could not be sent. Please contact support.'
            )

        transaction.on_commit(send_confirmation_after_commit)
        return response


class ReviewSkillProofView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def patch(self, request, application_id):
        application = get_object_or_404(Application, id=application_id, job__employer=request.user)
        proof = get_object_or_404(SkillProof, application=application)
        next_status = request.data.get('status')
        if next_status not in (SkillProof.Status.VERIFIED, SkillProof.Status.NEEDS_WORK):
            return Response({'status': 'Choose verified or needs_work.'}, status=status.HTTP_400_BAD_REQUEST)
        review_note = str(request.data.get('review_note', '')).strip()
        if len(review_note) > 3000:
            return Response({'review_note': 'Review note cannot exceed 3000 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        proof.status = next_status
        proof.review_note = review_note
        proof.reviewed_by = request.user
        proof.reviewed_at = timezone.now()
        proof.save(update_fields=['status', 'review_note', 'reviewed_by', 'reviewed_at', 'updated_at'])
        return Response(ApplicationSerializer(application, context={'request': request}).data)


class MyApplicationsView(ListAPIView):

    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsSeeker]

    def get_queryset(self):

        return Application.objects.filter(
            applicant=self.request.user
        ).select_related('job').prefetch_related('status_history')


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
        ).select_related('applicant').prefetch_related('status_history')



class UpdateApplicationStatusView(UpdateAPIView):

    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsAuthenticated, IsEmployer]
    http_method_names = ['put', 'patch']

    def get_queryset(self):

        return Application.objects.filter(
            job__employer=self.request.user
        )

    @transaction.atomic
    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        application = serializer.save()
        if previous_status != application.status:
            ApplicationStatusEvent.objects.create(
                application=application,
                from_status=previous_status,
                to_status=application.status,
                changed_by=self.request.user,
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

        job_wise_stats = list(applications.values(
            'job_id', 'job__title'
        ).annotate(
            total_applications=Count('id')
        ))

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

    @transaction.atomic
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
            previous_status = application.status
            application.status = Application.Status.INTERVIEW
            application.save(update_fields=['status'])
            ApplicationStatusEvent.objects.create(
                application=application,
                from_status=previous_status,
                to_status=application.status,
                changed_by=request.user,
            )

        serializer = VideoInterviewSerializer(interview, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyInterviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'employer' or user.is_staff or user.is_superuser:
            interviews = VideoInterview.objects.filter(employer=user).select_related('application', 'candidate', 'application__job', 'feedback_record')
        else:
            interviews = VideoInterview.objects.filter(candidate=user).select_related('application', 'employer', 'application__job', 'feedback_record')

        serializer = VideoInterviewSerializer(interviews, many=True, context={'request': request})
        return Response(serializer.data)


class InterviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        interview = get_object_or_404(VideoInterview.objects.select_related('feedback_record'), room_id=room_id)
        # Check permissions: only employer, candidate or admin
        if request.user not in [interview.employer, interview.candidate] and not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'You are not authorized to join this interview.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = VideoInterviewSerializer(interview, context={'request': request})
        return Response(serializer.data)


class InterviewFeedbackView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def post(self, request, interview_id):
        interview = get_object_or_404(VideoInterview, id=interview_id, employer=request.user)
        serializer = InterviewFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        feedback, _ = InterviewFeedback.objects.update_or_create(
            interview=interview,
            defaults={
                'interviewer': request.user,
                'rating': serializer.validated_data['rating'],
                'feedback': serializer.validated_data['feedback'],
                'is_approved': False,
                'approved_at': None,
            },
        )
        return Response(InterviewFeedbackSerializer(feedback).data, status=status.HTTP_200_OK)

    def patch(self, request, interview_id):
        interview = get_object_or_404(VideoInterview, id=interview_id, employer=request.user)
        feedback = get_object_or_404(InterviewFeedback, interview=interview)
        approve = request.data.get('approve')
        if not isinstance(approve, bool):
            return Response({'error': 'approve must be true or false.'}, status=status.HTTP_400_BAD_REQUEST)
        feedback.is_approved = approve
        feedback.approved_at = timezone.now() if approve else None
        feedback.save(update_fields=['is_approved', 'approved_at', 'updated_at'])
        return Response(InterviewFeedbackSerializer(feedback).data)


class InterviewNotesView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def patch(self, request, room_id):
        interview = get_object_or_404(VideoInterview, room_id=room_id, employer=request.user)
        notes = request.data.get('notes')
        if not isinstance(notes, str):
            return Response({'error': 'notes must be text.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(notes) > 4000:
            return Response({'error': 'notes cannot exceed 4000 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        interview.notes = notes.strip()
        interview.save(update_fields=['notes'])
        return Response({'notes': interview.notes})


class AllEmployerApplicantsView(ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        qs = Application.objects.filter(
            job__employer=self.request.user
        ).select_related('applicant', 'job').prefetch_related('status_history').order_by('-applied_at')
        
        job_id = self.request.query_params.get('job_id')
        if job_id and job_id != 'all':
            qs = qs.filter(job_id=job_id)
            
        stage = self.request.query_params.get('status')
        if stage and stage != 'all':
            qs = qs.filter(status=stage)
            
        search = self.request.query_params.get('q')
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(college_name__icontains=search) |
                Q(job__title__icontains=search)
            )
        return qs


class TalentSearchView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        from django.contrib.auth import get_user_model
        from django.db.models import Q
        User = get_user_model()

        query = request.query_params.get('q', '').strip()
        skill = request.query_params.get('skill', '').strip()
        location = request.query_params.get('location', '').strip()

        users = User.objects.filter(role='seeker', is_active=True).order_by('-date_joined')

        if query:
            users = users.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(headline__icontains=query) |
                Q(skills__icontains=query) |
                Q(bio__icontains=query) |
                Q(email__icontains=query)
            )
        if skill:
            users = users.filter(skills__icontains=skill)
        if location:
            users = users.filter(location__icontains=location)

        results = []
        for u in users[:60]:
            name = f"{u.first_name} {u.last_name}".strip() or u.email.split('@')[0]
            skills_list = [s.strip() for s in (u.skills or '').split(',') if s.strip()]
            profile_img = None
            if u.profile_image:
                try:
                    profile_img = request.build_absolute_uri(u.profile_image.url)
                except Exception:
                    profile_img = u.profile_image.url
            resume_url = None
            if u.resume:
                try:
                    resume_url = request.build_absolute_uri(u.resume.url)
                except Exception:
                    resume_url = u.resume.url

            results.append({
                'id': u.id,
                'name': name,
                'email': u.email,
                'headline': u.headline or 'Candidate / Software Professional',
                'location': u.location or 'India',
                'experience_years': u.experience_years or 0,
                'education': u.education or 'B.Tech / Graduate',
                'skills': skills_list,
                'profile_image': profile_img,
                'resume_url': resume_url,
                'linkedin_url': u.linkedin_url or '',
                'github_url': u.github_url or '',
                'date_joined': u.date_joined,
            })

        return Response(results)

