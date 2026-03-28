from rest_framework import serializers
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):

    applicant_email = serializers.ReadOnlyField(source='applicant.email')
    applicant_name = serializers.SerializerMethodField()
    applicant_profile_image_url = serializers.SerializerMethodField()
    job_title = serializers.ReadOnlyField(source='job.title')
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'applicant',
            'applicant_email',
            'applicant_name',
            'applicant_profile_image_url',
            'job',
            'job_title',
            'full_name',
            'college_name',
            'phone_number',
            'resume',
            'resume_url',
            'cover_letter',
            'skills',
            'status',
            'applied_at',
        ]

        read_only_fields = [
            'applicant',
            'job',
            'status',
            'applied_at',
        ]

    def validate_resume(self, value):

        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError(
                "Only PDF files are allowed."
            )

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Resume file too large (Max 5MB)."
            )

        return value

    def get_resume_url(self, obj):
        if not obj.resume:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.resume.url)
        return obj.resume.url

    def get_applicant_profile_image_url(self, obj):
        if not obj.applicant.profile_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.applicant.profile_image.url)
        return obj.applicant.profile_image.url

    def get_applicant_name(self, obj):
        full_name = f"{obj.applicant.first_name} {obj.applicant.last_name}".strip()
        return full_name or obj.applicant.email


class ApplicationStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application
        fields = ['status']
