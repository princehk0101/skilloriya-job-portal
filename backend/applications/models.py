from django.db import models
from django.conf import settings
from jobs.models import Job


class Application(models.Model):

    class Status(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        WAITLIST = 'waitlist', 'Waitlist'
        SCREENING = 'screening', 'Screening'
        INTERVIEW = 'interview', 'Interview'
        OFFER = 'offer', 'Offer'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        REJECTED = 'rejected', 'Rejected'
        ACCEPTED = 'accepted', 'Accepted'

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    full_name = models.CharField(max_length=255)
    college_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)

    resume = models.FileField(upload_to='resumes/')
    resume_version = models.ForeignKey(
        'users.ResumeVersion',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
    )

    cover_letter = models.TextField(blank=True)
    skills = models.TextField(blank=True, help_text="Comma-separated or descriptive skills")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('applicant', 'job')
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['applied_at']),
        ]

    def __str__(self):
        return f"{self.applicant.email} → {self.job.title}"


class ApplicationStatusEvent(models.Model):
    """An auditable, candidate-visible record of an application's status."""

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20, choices=Application.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='application_status_events',
    )
    is_baseline = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f"Application {self.application_id}: {self.from_status} -> {self.to_status}"


class SkillProof(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        VERIFIED = 'verified', 'Verified'
        NEEDS_WORK = 'needs_work', 'Needs improvement'

    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='skill_proof')
    skills_demonstrated = models.CharField(max_length=500)
    artifact_url = models.URLField(max_length=1000, blank=True)
    explanation = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    review_note = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='skill_proofs_reviewed')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Skill proof for application {self.application_id} ({self.status})"


class VideoInterview(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='video_interviews'
    )
    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='scheduled_interviews_as_employer'
    )
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='scheduled_interviews_as_candidate'
    )
    room_id = models.CharField(max_length=120, unique=True)
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"Interview {self.room_id}: {self.candidate.email} & {self.employer.email}"


class InterviewFeedback(models.Model):
    interview = models.OneToOneField(
        VideoInterview,
        on_delete=models.CASCADE,
        related_name='feedback_record',
    )
    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='interview_feedback_given',
    )
    rating = models.PositiveSmallIntegerField()
    feedback = models.TextField()
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Feedback for interview {self.interview_id}"

