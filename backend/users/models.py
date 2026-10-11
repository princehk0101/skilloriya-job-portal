from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import random
from datetime import timedelta
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('role', 'employer')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None

    ROLE_CHOICES = (
        ('seeker', 'Seeker'),
        ('employer', 'Employer'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_verified = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True, help_text='Comma-separated skills')
    experience_years = models.PositiveIntegerField(default=0)
    job_email_alerts = models.BooleanField(default=True)
    is_approved_by_admin = models.BooleanField(default=False, help_text='Only for recruiters')
    education = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    designation = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class EmailOTP(models.Model):
    PURPOSE_CHOICES = [
        ('verification', 'Email verification'),
        ('login', 'Login'),
        ('password_reset', 'Password reset'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='login')
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        return str(random.randint(100000, 999999))

    @property
    def is_expired(self):
        return timezone.now() >= self.created_at + timedelta(minutes=10)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"


class Work(models.Model):
    """User-posted work / portfolio entry."""

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='works'
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    link = models.URLField(blank=True, null=True)
    attachment = models.FileField(upload_to='works/', blank=True, null=True)
    is_public = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.owner.email} - {self.title}"


class ChatMessage(models.Model):
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_messages'
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.email} -> {self.recipient.email}: {self.content[:30]}"


class UserSubscription(models.Model):
    PLAN_CHOICES = [
        ('free', 'Free Starter'),
        ('pro_seeker', 'Pro Seeker'),
        ('recruiter_pro', 'Recruiter Pro'),
        ('enterprise', 'Enterprise Unlimited'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='subscription'
    )
    plan = models.CharField(max_length=50, choices=PLAN_CHOICES, default='free')
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan} ({'Active' if self.is_active else 'Expired'})"


class ResumeVersion(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='resume_versions',
    )
    name = models.CharField(max_length=120)
    file = models.FileField(upload_to='resumes/versions/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"

