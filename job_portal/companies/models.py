from django.db import models
from django.conf import settings


class Company(models.Model):

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company'
    )

    name = models.CharField(max_length=255)
    description = models.TextField()
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Microtask(models.Model):
    """Short, paid/contest microtasks posted by a company."""

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='microtasks'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    reward = models.PositiveIntegerField(default=0, help_text="Reward in smallest currency unit")
    deadline = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company.name} - {self.title}"