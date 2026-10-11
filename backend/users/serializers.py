from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Work, ResumeVersion


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'role', 'company_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        self.user = user
        refresh = RefreshToken.for_user(user)
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        self.user = user
        return value


class OTPLoginVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(email=data["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if not user.is_verified and not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError("Email not verified")

        otp_obj = user.emailotp_set.filter(otp=data["otp"], purpose='login').last()
        if not otp_obj or otp_obj.is_expired:
            if otp_obj:
                otp_obj.delete()
            raise serializers.ValidationError("Invalid OTP")

        self.user = user
        self.otp_obj = otp_obj

        refresh = RefreshToken.for_user(user)
        data["tokens"] = {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "job_email_alerts": user.job_email_alerts,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        return data


class ProfileSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "role",
            "is_verified",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_approved_by_admin",
            "first_name",
            "last_name",
            "profile_image",
            "profile_image_url",
            "resume",
            "resume_url",
            "phone_number",
            "location",
            "headline",
            "bio",
            "skills",
            "experience_years",
            "job_email_alerts",
            "education",
            "company_name",
            "designation",
            "website",
            "linkedin_url",
            "github_url",
        ]
        read_only_fields = ["id", "email", "role", "is_verified", "is_active", "is_staff", "is_superuser"]

    def to_internal_value(self, data):
        # Handle empty strings from FormData for integers and URLs
        data_dict = data.dict() if hasattr(data, 'dict') else (data.copy() if hasattr(data, 'copy') else dict(data))
        if 'experience_years' in data_dict:
            val = data_dict.get('experience_years')
            if val == '' or val is None:
                data_dict['experience_years'] = 0
        for url_field in ['website', 'linkedin_url', 'github_url']:
            if url_field in data_dict:
                val = data_dict.get(url_field)
                if val == '' or val is None:
                    data_dict[url_field] = ''
        return super().to_internal_value(data_dict)

    def get_profile_image_url(self, obj):
        if not obj.profile_image:
            return None
        name = str(obj.profile_image)
        if name.startswith('http://') or name.startswith('https://'):
            return name
        request = self.context.get("request")
        if request:
            try:
                return request.build_absolute_uri(obj.profile_image.url)
            except Exception:
                return obj.profile_image.url
        try:
            return obj.profile_image.url
        except Exception:
            return str(obj.profile_image)

    def get_resume_url(self, obj):
        if not obj.resume:
            return None
        name = str(obj.resume)
        if name.startswith('http://') or name.startswith('https://'):
            return name
        request = self.context.get("request")
        if request:
            try:
                return request.build_absolute_uri(obj.resume.url)
            except Exception:
                return obj.resume.url
        try:
            return obj.resume.url
        except Exception:
            return str(obj.resume)

    def validate_profile_image(self, value):
        if value and hasattr(value, 'size') and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Profile image too large (max 5MB).")
        return value

    def validate_resume(self, value):
        if value and hasattr(value, 'size'):
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Resume too large (max 10MB).")
            import os
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in ['.pdf', '.doc', '.docx']:
                raise serializers.ValidationError("Only PDF, DOC, or DOCX formats are supported.")
        return value


class WorkSerializer(serializers.ModelSerializer):
    owner_email = serializers.ReadOnlyField(source='owner.email')
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Work
        fields = [
            'id',
            'owner',
            'owner_email',
            'title',
            'description',
            'link',
            'attachment',
            'attachment_url',
            'is_public',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['owner', 'owner_email', 'created_at', 'updated_at']

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.attachment.url)
        return obj.attachment.url


class ResumeVersionSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ResumeVersion
        fields = ['id', 'name', 'file', 'file_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_file(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Resume file too large (maximum 10 MB).')
        extension = value.name.lower().rsplit('.', 1)[-1]
        if extension not in ['pdf', 'doc', 'docx']:
            raise serializers.ValidationError('Only PDF, DOC, or DOCX files are supported.')
        return value

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url
