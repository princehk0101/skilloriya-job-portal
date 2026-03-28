from rest_framework import serializers
from .models import Skill


class SkillSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skill
        fields = "__all__"
        read_only_fields = ["id", "slug", "created_at"]

    def validate_name(self, value):

        if Skill.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Skill already exists")

        return value