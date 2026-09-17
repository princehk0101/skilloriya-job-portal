from django.db.models import Q, Max, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from users.models import ChatMessage, User
from .chat_serializers import ChatMessageSerializer


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        messages = ChatMessage.objects.filter(Q(sender=user) | Q(recipient=user))
        
        partner_ids = set()
        for msg in messages:
            if msg.sender_id != user.id:
                partner_ids.add(msg.sender_id)
            if msg.recipient_id != user.id:
                partner_ids.add(msg.recipient_id)

        conversations = []
        for pid in partner_ids:
            try:
                partner = User.objects.get(id=pid)
            except User.DoesNotExist:
                continue

            last_msg = ChatMessage.objects.filter(
                (Q(sender=user, recipient=partner) | Q(sender=partner, recipient=user))
            ).order_by('-created_at').first()

            unread_count = ChatMessage.objects.filter(
                sender=partner, recipient=user, is_read=False
            ).count()

            partner_name = f"{partner.first_name} {partner.last_name}".strip() or partner.email

            conversations.append({
                'partner_id': partner.id,
                'partner_email': partner.email,
                'partner_name': partner_name,
                'partner_role': partner.role,
                'partner_company': getattr(partner, 'company_name', '') or (partner.company.name if hasattr(partner, 'company') else ''),
                'last_message': last_msg.content if last_msg else '',
                'last_message_at': last_msg.created_at if last_msg else None,
                'unread_count': unread_count,
            })

        conversations.sort(key=lambda c: str(c['last_message_at'] or ''), reverse=True)
        return Response(conversations)


class MessageHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, partner_id):
        user = request.user
        try:
            partner = User.objects.get(id=partner_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Mark unread messages as read
        ChatMessage.objects.filter(sender=partner, recipient=user, is_read=False).update(is_read=True)

        messages = ChatMessage.objects.filter(
            (Q(sender=user, recipient=partner) | Q(sender=partner, recipient=user))
        ).order_by('created_at')

        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        recipient_id = request.data.get('recipient_id')
        content = (request.data.get('content') or '').strip()
        job_id = request.data.get('job_id')

        if not recipient_id or not content:
            return Response({'error': 'recipient_id and content are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({'error': 'Recipient does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        msg = ChatMessage.objects.create(
            sender=user,
            recipient=recipient,
            content=content,
            job_id=job_id if job_id else None,
        )

        serializer = ChatMessageSerializer(msg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MarkMessagesReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, partner_id):
        user = request.user
        ChatMessage.objects.filter(sender_id=partner_id, recipient=user, is_read=False).update(is_read=True)
        return Response({'message': 'Messages marked as read.'})
