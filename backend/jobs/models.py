from django.db import models
from django.conf import settings

class JobCategory(models.Model):

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Job(models.Model):

    JOB_TYPE_CHOICES = (
        ('remote', 'Remote'),
        ('onsite', 'Onsite'),
        ('hybrid', 'Hybrid'),
    )

    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    #  Category relation
    category = models.ForeignKey(
        JobCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='jobs'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=list, blank=True)
    practical_challenge = models.TextField(blank=True)
    location = models.CharField(max_length=255)

    # Prevent negative salary
    salary = models.PositiveIntegerField()

    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES
    )

    # Prevent negative experience
    experience_required = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['location']),
            models.Index(fields=['job_type']),
            models.Index(fields=['salary']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.title


class SavedJob(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_jobs',
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'job'], name='unique_saved_job'),
        ]
        ordering = ['-created_at']


class JobAlert(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_alerts',
    )
    name = models.CharField(max_length=120)
    keyword = models.CharField(max_length=255, blank=True)
    skills = models.TextField(blank=True, help_text='Comma-separated skills; an alert matches any listed skill')
    location = models.CharField(max_length=255, blank=True)
    job_type = models.CharField(max_length=20, choices=Job.JOB_TYPE_CHOICES, blank=True)
    min_salary = models.PositiveIntegerField(null=True, blank=True)
    max_salary = models.PositiveIntegerField(null=True, blank=True)
    experience_required = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
