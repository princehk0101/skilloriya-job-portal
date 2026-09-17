from django.db import models
from django.utils.text import slugify


class Skill(models.Model):

    CATEGORY_CHOICES = [
        ("Programming", "Programming"),
        ("Framework", "Framework"),
        ("Database", "Database"),
        ("Tool", "Tool"),
        ("Other", "Other"),
    ]

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    category = models.CharField(
        max_length=100,
        choices=CATEGORY_CHOICES,
        default="Other"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Assessment(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
        ('Hard', 'Hard'),
        ('Expert', 'Expert'),
    ]

    title = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    category = models.CharField(max_length=100, default='General')
    time_minutes = models.PositiveIntegerField(default=30)
    passing_score = models.PositiveIntegerField(default=70, help_text="Passing percentage (e.g. 70%)")
    level = models.CharField(max_length=30, choices=LEVEL_CHOICES, default='Intermediate')
    icon_name = models.CharField(max_length=50, default='Code')
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class AssessmentQuestion(models.Model):
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    explanation = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.assessment.title} - Q#{self.id}"


class UserAssessmentResult(models.Model):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='assessment_results'
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='user_results'
    )
    score_percentage = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    correct_answers = models.PositiveIntegerField()
    passed = models.BooleanField(default=False)
    badge_title = models.CharField(max_length=100, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.email} - {self.assessment.title} ({self.score_percentage}%)"