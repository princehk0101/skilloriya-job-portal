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

        # Include recruiters/candidates from job applications
        from applications.models import Application
        from companies.models import Company

        app_info_map = {}  # partner_id -> {'job_id': ..., 'job_title': ..., 'status': ..., 'company': ...}

        if user.role == 'employer':
            employer_apps = Application.objects.filter(job__employer=user).select_related('applicant', 'job')
            for app in employer_apps:
                pid = app.applicant_id
                partner_ids.add(pid)
                if pid not in app_info_map:
                    app_info_map[pid] = {
                        'job_id': app.job_id,
                        'job_title': app.job.title if app.job else '',
                        'status': app.status,
                        'company': getattr(user, 'company_name', '') or '',
                    }
        else:
            # Job seeker: include recruiters of applied jobs
            seeker_apps = Application.objects.filter(applicant=user).select_related('job__employer', 'job')
            for app in seeker_apps:
                recruiter = getattr(app.job, 'employer', None)
                if recruiter and recruiter.id != user.id:
                    partner_ids.add(recruiter.id)
                    if recruiter.id not in app_info_map:
                        app_info_map[recruiter.id] = {
                            'job_id': app.job_id,
                            'job_title': app.job.title if app.job else '',
                            'status': app.status,
                            'company': getattr(recruiter, 'company_name', '') or '',
                        }

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
            app_meta = app_info_map.get(pid, {})

            # Determine company
            company_name = getattr(partner, 'company_name', '') or app_meta.get('company', '')
            if not company_name and partner.role == 'employer':
                comp_obj = Company.objects.filter(owner_email=partner.email).first()
                if comp_obj:
                    company_name = comp_obj.name

            conversations.append({
                'partner_id': partner.id,
                'partner_email': partner.email,
                'partner_name': partner_name,
                'partner_role': partner.role,
                'partner_company': company_name,
                'job_id': app_meta.get('job_id', getattr(last_msg, 'job_id', None)),
                'job_title': app_meta.get('job_title', getattr(last_msg, 'job_title', '') if last_msg else ''),
                'application_status': app_meta.get('status', ''),
                'last_message': last_msg.content if last_msg else ('Applied for role' if app_meta else ''),
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
