from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


class NotificationActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture']


class NotificationSerializer(serializers.ModelSerializer):
    actor = NotificationActorSerializer(read_only=True)
    target_news_title = serializers.CharField(source='target_news.title', read_only=True)
    conversation_id = serializers.IntegerField(source='conversation.id', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'content', 'is_read', 'created_at',
            'actor', 'target_news', 'target_news_title',
            'target_comment', 'conversation_id',
        ]
        read_only_fields = fields