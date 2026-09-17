import django_filters
from .models import Job


class JobFilter(django_filters.FilterSet):

    location = django_filters.CharFilter(
        field_name="location",
        lookup_expr="icontains"
    )

    min_salary = django_filters.NumberFilter(
        field_name="salary",
        lookup_expr="gte"
    )

    max_salary = django_filters.NumberFilter(
        field_name="salary",
        lookup_expr="lte"
    )

    category = django_filters.NumberFilter(
        field_name="category"
    )

    job_type = django_filters.CharFilter(
        field_name="job_type"
    )

    class Meta:
        model = Job
        fields = [
            "location",
            "category",
            "job_type",
            "experience_required"
        ]