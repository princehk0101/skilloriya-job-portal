from django.urls import path
from .chat_views import (
    ConversationListView,
    MessageHistoryView,
    SendMessageView,
    MarkMessagesReadView,
)

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='chat-conversations'),
    path('messages/<int:partner_id>/', MessageHistoryView.as_view(), name='chat-messages'),
    path('send/', SendMessageView.as_view(), name='chat-send'),
    path('mark-read/<int:partner_id>/', MarkMessagesReadView.as_view(), name='chat-mark-read'),
]
