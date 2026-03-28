from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import random


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
    phone_number = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True, help_text='Comma-separated skills')
    experience_years = models.PositiveIntegerField(default=0)
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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        return str(random.randint(100000, 999999))

    def __str__(self):
        return f"{self.user.email} - {self.otp}"
