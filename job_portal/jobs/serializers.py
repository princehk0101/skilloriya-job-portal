from rest_framework import serializers
from .models import Job, JobCategory



class JobCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = JobCategory
        fields = ["id", "name", "slug"]



class JobSerializer(serializers.ModelSerializer):

    employer_email = serializers.ReadOnlyField(source="employer.email")
    employer_name = serializers.SerializerMethodField()
    employer_image_url = serializers.SerializerMethodField()
    job_type_display = serializers.SerializerMethodField()

    category_name = serializers.ReadOnlyField(source="category.name")

    class Meta:
        model = Job
        fields = [
            "id",
            "employer_email",
            "employer_name",
            "employer_image_url",
            "title",
            "description",
            "location",
            "salary",
            "job_type",
            "job_type_display",
            "experience_required",
            "category",        
            "category_name",   
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "employer_email",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_job_type_display(self, obj):
        return obj.get_job_type_display()

    def get_employer_name(self, obj):
        full_name = f"{obj.employer.first_name} {obj.employer.last_name}".strip()
        return full_name or obj.employer.email

    def get_employer_image_url(self, obj):
        if not obj.employer.profile_image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.employer.profile_image.url)
        return obj.employer.profile_image.url
