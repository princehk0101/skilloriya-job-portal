from rest_framework import serializers
from .models import Job, JobCategory, SavedJob, JobAlert



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
    is_saved = serializers.SerializerMethodField()
    company_verified = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id",
            "employer_email",
            "employer_name",
            "employer_image_url",
            "title",
            "description",
            "required_skills",
            "practical_challenge",
            "location",
            "salary",
            "job_type",
            "job_type_display",
            "experience_required",
            "category",        
            "category_name",   
            "is_active",
            "is_featured",
            "is_saved",
            "company_verified",
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

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return SavedJob.objects.filter(user=request.user, job=obj).exists()

    def get_company_verified(self, obj):
        if hasattr(obj.employer, 'company'):
            return obj.employer.company.is_verified
        return False



class SavedJobSerializer(serializers.ModelSerializer):
    job_detail = JobSerializer(source='job', read_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_detail', 'created_at']
        read_only_fields = ['id', 'created_at']


class JobAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAlert
        fields = [
            'id', 'name', 'keyword', 'skills', 'location', 'job_type',
            'min_salary', 'max_salary', 'experience_required',
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        minimum = attrs.get('min_salary', getattr(self.instance, 'min_salary', None))
        maximum = attrs.get('max_salary', getattr(self.instance, 'max_salary', None))
        if minimum is not None and maximum is not None and minimum > maximum:
            raise serializers.ValidationError({'max_salary': 'Maximum salary must be greater than minimum salary.'})
        return attrs
