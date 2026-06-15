from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Work


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'role']
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

        if not user.is_verified and not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError("Email not verified")

        refresh = RefreshToken.for_user(user)

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if not user.is_verified and not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError("Email not verified")

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

        otp_obj = user.emailotp_set.filter(otp=data["otp"]).last()
        if not otp_obj:
            raise serializers.ValidationError("Invalid OTP")

        self.user = user
        self.otp_obj = otp_obj

        refresh = RefreshToken.for_user(user)
        data["tokens"] = {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        return data


class ProfileSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

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
            "first_name",
            "last_name",
            "profile_image",
            "profile_image_url",
            "phone_number",
            "location",
            "headline",
            "bio",
            "skills",
            "experience_years",
            "education",
            "company_name",
            "designation",
            "website",
            "linkedin_url",
            "github_url",
        ]
        read_only_fields = ["id", "email", "role", "is_verified", "is_active", "is_staff", "is_superuser"]

    def get_profile_image_url(self, obj):
        if not obj.profile_image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.profile_image.url)
        return obj.profile_image.url

    def validate_profile_image(self, value):
        if value and value.size > 3 * 1024 * 1024:
            raise serializers.ValidationError("Profile image too large (max 3MB).")
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
