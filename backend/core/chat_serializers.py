from rest_framework import serializers
from users.models import ChatMessage, User
from jobs.models import Job


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')
    sender_name = serializers.SerializerMethodField()
    recipient_email = serializers.ReadOnlyField(source='recipient.email')
    recipient_name = serializers.SerializerMethodField()
    job_title = serializers.ReadOnlyField(source='job.title')

    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'sender',
            'sender_email',
            'sender_name',
            'recipient',
            'recipient_email',
            'recipient_name',
            'job',
            'job_title',
            'content',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'sender', 'sender_email', 'sender_name', 'recipient_email', 'recipient_name', 'created_at']

    def get_sender_name(self, obj):
        name = f"{obj.sender.first_name} {obj.sender.last_name}".strip()
        return name or obj.sender.email

    def get_recipient_name(self, obj):
        name = f"{obj.recipient.first_name} {obj.recipient.last_name}".strip()
        return name or obj.recipient.email
