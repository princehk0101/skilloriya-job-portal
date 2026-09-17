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

