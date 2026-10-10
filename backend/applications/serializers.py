from rest_framework import serializers
from django.core.files.base import ContentFile
from .models import Application, ApplicationStatusEvent, InterviewFeedback, SkillProof
import os


class ApplicationStatusEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusEvent
        fields = ['id', 'from_status', 'to_status', 'is_baseline', 'created_at']
        read_only_fields = fields


class ApplicationSerializer(serializers.ModelSerializer):

    applicant_email = serializers.ReadOnlyField(source='applicant.email')
    applicant_name = serializers.SerializerMethodField()
    applicant_profile_image_url = serializers.SerializerMethodField()
    job_title = serializers.ReadOnlyField(source='job.title')
    resume_url = serializers.SerializerMethodField()
    status_history = ApplicationStatusEventSerializer(many=True, read_only=True)
    skill_proof = serializers.SerializerMethodField()

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
            'resume_version',
            'cover_letter',
            'skills',
            'status',
            'status_history',
            'skill_proof',
            'applied_at',
        ]

        read_only_fields = [
            'applicant',
            'job',
            'status',
            'resume_version',
            'applied_at',
        ]
        extra_kwargs = {
            'resume': {'required': False},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        resume = attrs.get('resume')
        resume_version = self.context.get('resume_version')
        if not resume and not resume_version and (not request or not getattr(request.user, 'resume', None)):
            raise serializers.ValidationError({"resume": "Please upload a resume file (PDF) to proceed."})
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        resume_version = self.context.get('resume_version')
        if not validated_data.get('resume') and resume_version:
            validated_data['resume_version'] = resume_version
            application = super().create(validated_data)
            resume_version.file.open('rb')
            try:
                application.resume.save(
                    os.path.basename(resume_version.file.name),
                    ContentFile(resume_version.file.read()),
                    save=False,
                )
            finally:
                resume_version.file.close()
            application.save(update_fields=['resume'])
            return application
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

    def get_skill_proof(self, obj):
        try:
            proof = obj.skill_proof
        except SkillProof.DoesNotExist:
            return None
        return {
            'id': proof.id,
            'skills_demonstrated': proof.skills_demonstrated,
            'artifact_url': proof.artifact_url,
            'explanation': proof.explanation,
            'status': proof.status,
            'review_note': proof.review_note,
            'reviewed_at': proof.reviewed_at,
            'created_at': proof.created_at,
        }


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
    feedback = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()

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
            'feedback',
        ]
        read_only_fields = ['id', 'employer', 'employer_email', 'candidate_email', 'candidate_name', 'job_title', 'created_at']

    def get_candidate_name(self, obj):
        return f"{obj.candidate.first_name} {obj.candidate.last_name}".strip() or obj.candidate.email

    def get_notes(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.candidate:
            return ''
        return obj.notes

    def get_feedback(self, obj):
        try:
            record = obj.feedback_record
        except InterviewFeedback.DoesNotExist:
            return None
        request = self.context.get('request')
        if request and request.user == obj.candidate and not record.is_approved:
            return None
        return {
            'rating': record.rating,
            'feedback': record.feedback,
            'is_approved': record.is_approved,
            'approved_at': record.approved_at,
        }


class InterviewFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewFeedback
        fields = ['id', 'rating', 'feedback', 'is_approved', 'approved_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_approved', 'approved_at', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate_feedback(self, value):
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise serializers.ValidationError('Feedback must contain at least 10 characters.')
        if len(cleaned) > 4000:
            raise serializers.ValidationError('Feedback cannot exceed 4000 characters.')
        return cleaned

