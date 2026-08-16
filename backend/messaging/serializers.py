from rest_framework import serializers
from .models import Conversation, ConversationParticipant, Message, ArticleThread, ArticleThreadMessage
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'author', 'content',
                  'shared_news', 'created_at', 'updated_at']
        read_only_fields = ['id', 'conversation', 'author', 'created_at', 'updated_at']


class ConversationParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ConversationParticipant
        fields = ['id', 'user', 'joined_at', 'last_read_at']


class ConversationListSerializer(serializers.ModelSerializer):
    last_message = MessageSerializer(read_only=True)
    participant_count = serializers.IntegerField(read_only=True)
    other_user = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'is_group', 'last_message', 'participant_count',
                  'other_user', 'unread_count', 'updated_at']

    def get_other_user(self, obj):
        if obj.is_group:
            return None
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        other = obj.participants.exclude(user=request.user).first()
        if other:
            return UserSerializer(other.user).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        participant = obj.participants.filter(user=request.user).first()
        if not participant or not participant.last_read_at:
            return obj.messages.exclude(author=request.user).count()
        return obj.messages.exclude(author=request.user).filter(
            created_at__gt=participant.last_read_at
        ).count()


class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = ConversationParticipantSerializer(many=True, read_only=True)
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'is_group', 'created_by', 'created_at',
                  'updated_at', 'participants', 'messages']

    def get_messages(self, obj):
        msgs = obj.messages.select_related('author').order_by('-created_at')[:50]
        return MessageSerializer(msgs, many=True).data


class CreateConversationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    is_group = serializers.BooleanField(default=False)
    participant_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)

    def validate_participant_ids(self, value):
        from accounts.models import User
        users = User.objects.filter(id__in=value)
        if len(users) != len(value):
            raise serializers.ValidationError("One or more user IDs are invalid.")
        return value


class ThreadMessageSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = ArticleThreadMessage
        fields = ['id', 'thread', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'thread', 'author', 'created_at']


class ArticleThreadSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    news_title = serializers.CharField(source='news.title', read_only=True)
    message_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ArticleThread
        fields = ['id', 'news', 'news_title', 'created_at', 'message_count', 'messages']

    def get_messages(self, obj):
        msgs = obj.messages.select_related('author').order_by('-created_at')[:50]
        return ThreadMessageSerializer(msgs, many=True).data
