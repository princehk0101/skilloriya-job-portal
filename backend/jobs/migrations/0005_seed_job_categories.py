from django.db import migrations
from django.utils.text import slugify


DEFAULT_CATEGORIES = [
    "Design",
    "Development",
    "Marketing",
    "Finance",
    "Management",
    "Sales",
    "Customer Support",
    "Human Resource",
    "Data Analytics",
]


def seed_job_categories(apps, schema_editor):
    JobCategory = apps.get_model("jobs", "JobCategory")

    for name in DEFAULT_CATEGORIES:
        JobCategory.objects.get_or_create(
            name=name,
            defaults={"slug": slugify(name)},
        )


def unseed_job_categories(apps, schema_editor):
    JobCategory = apps.get_model("jobs", "JobCategory")
    JobCategory.objects.filter(name__in=DEFAULT_CATEGORIES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("jobs", "0004_jobcategory_job_category"),
    ]

    operations = [
        migrations.RunPython(seed_job_categories, unseed_job_categories),
    ]
