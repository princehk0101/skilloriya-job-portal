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