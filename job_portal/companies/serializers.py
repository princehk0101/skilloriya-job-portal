from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):

    owner_email = serializers.ReadOnlyField(source='owner.email')
    logo_url = serializers.SerializerMethodField()

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
            'created_at',
        ]
        read_only_fields = ['owner', 'owner_email', 'created_at']

    def validate(self, data):
        user = self.context['request'].user

        # Allow update on existing company, block only duplicate create.
        if not self.instance and Company.objects.filter(owner=user).exists():
            raise serializers.ValidationError("You already created a company.")

        return data

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url
