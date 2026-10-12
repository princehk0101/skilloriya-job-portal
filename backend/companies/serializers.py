from rest_framework import serializers
from django.db.models import Avg
from .models import Company, Microtask, CompanyReview



class CompanyReviewSerializer(serializers.ModelSerializer):
    reviewer_email = serializers.ReadOnlyField(source='reviewer.email')
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = CompanyReview
        fields = [
            'id',
            'company',
            'reviewer',
            'reviewer_email',
            'reviewer_name',
            'rating',
            'title',
            'review',
            'pros',
            'cons',
            'salary_estimate',
            'created_at',
        ]
        read_only_fields = ['id', 'reviewer', 'reviewer_email', 'reviewer_name', 'created_at']

    def get_reviewer_name(self, obj):
        name = f"{obj.reviewer.first_name} {obj.reviewer.last_name}".strip()
        return name or obj.reviewer.email


class CompanySerializer(serializers.ModelSerializer):

    owner_email = serializers.ReadOnlyField(source='owner.email')
    logo_url = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id',
            'owner',
            'owner_email',
            'name',
            'description',
            'website',
            'location',
            'logo',
            'logo_url',
            'is_verified',
            'is_featured',
            'average_rating',
            'reviews_count',
            'created_at',
        ]
        read_only_fields = ['owner', 'owner_email', 'is_verified', 'is_featured', 'created_at']

    def validate(self, data):
        user = self.context['request'].user

        # Allow update on existing company, block only duplicate create.
        if not self.instance and Company.objects.filter(owner=user).exists():
            raise serializers.ValidationError("You already created a company.")

        return data

    def create(self, validated_data):
        from core.storage_service import upload_image_to_imagekit, is_imagekit_configured
        logo_file = validated_data.get('logo')
        if logo_file and is_imagekit_configured():
            url = upload_image_to_imagekit(logo_file, folder="company_logos")
            if url:
                validated_data['logo'] = url
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from core.storage_service import upload_image_to_imagekit, is_imagekit_configured
        if 'logo' in validated_data and validated_data['logo'] and is_imagekit_configured():
            logo_file = validated_data.pop('logo')
            url = upload_image_to_imagekit(logo_file, folder="company_logos")
            if url:
                instance.logo = url
            else:
                instance.logo = logo_file
        return super().update(instance, validated_data)

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        logo_str = str(obj.logo)
        if logo_str.startswith('http://') or logo_str.startswith('https://'):
            return logo_str
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg is not None else None

    def get_reviews_count(self, obj):
        return obj.reviews.count()



class MicrotaskSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')

    class Meta:
        model = Microtask
        fields = [
            'id',
            'company',
            'company_name',
            'title',
            'description',
            'reward',
            'deadline',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['company', 'company_name', 'created_at']
