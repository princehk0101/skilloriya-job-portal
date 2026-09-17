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
        extra_kwargs = {
            'resume': {'required': False},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        resume = attrs.get('resume')
        if not resume and (not request or not getattr(request.user, 'resume', None)):
            raise serializers.ValidationError({"resume": "Please upload a resume file (PDF) to proceed."})
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if not validated_data.get('resume') and request and request.user.resume:
            validated_data['resume'] = request.user.resume
        return super().create(validated_data)

    def validate_resume(self, value):
        if value:
            ext = value.name.lower().split('.')[-1]
            if ext not in ['pdf', 'doc', 'docx']:
                raise serializers.ValidationError("Only PDF, DOC, or DOCX files are allowed.")
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Resume file too large (Max 10MB).")
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


from .models import VideoInterview


class VideoInterviewSerializer(serializers.ModelSerializer):
    employer_email = serializers.ReadOnlyField(source='employer.email')
    candidate_email = serializers.ReadOnlyField(source='candidate.email')
    candidate_name = serializers.SerializerMethodField()
    job_title = serializers.ReadOnlyField(source='application.job.title')

    class Meta:
        model = VideoInterview
        fields = [
            'id',
            'application',
            'employer',
            'employer_email',
            'candidate',
            'candidate_email',
            'candidate_name',
            'job_title',
            'room_id',
            'scheduled_at',
            'status',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'employer', 'employer_email', 'candidate_email', 'candidate_name', 'job_title', 'created_at']

    def get_candidate_name(self, obj):
        return f"{obj.candidate.first_name} {obj.candidate.last_name}".strip() or obj.candidate.email

