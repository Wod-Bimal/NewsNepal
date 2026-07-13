from rest_framework import serializers
from accounts.models import User
from .models import News, Topic, Comment


class TopicSerializer(serializers.ModelSerializer):
    """Serializer for Topic model."""
    news_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'color', 'created_at', 'news_count']
        read_only_fields = ['id', 'created_at']
    
    def get_news_count(self, obj):
        return obj.news.count()


class UserSerializer(serializers.ModelSerializer):
    """Simplified user serializer for news posts."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model."""
    author = UserSerializer(read_only=True)
    like_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at', 'like_count', 'is_liked']
        read_only_fields = ['id', 'created_at']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False


class NewsSerializer(serializers.ModelSerializer):
    """Serializer for News model."""
    author = UserSerializer(read_only=True)
    topic = TopicSerializer(read_only=True)
    like_count = serializers.ReadOnlyField()
    share_count = serializers.ReadOnlyField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_shared = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = News
        fields = ['id', 'author', 'title', 'summary', 'content', 'topic', 'source_url', 'image',
                 'published_at', 'status', 'created_at', 'updated_at',
                 'like_count', 'share_count', 'comment_count',
                 'is_liked', 'is_shared', 'comments']
        read_only_fields = ['id', 'published_at', 'created_at', 'updated_at']
    
    def get_comment_count(self, obj):
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.shares.filter(id=request.user.id).exists()
        return False


class NewsCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating news posts."""
    
    class Meta:
        model = News
        fields = ['title', 'summary', 'content', 'topic', 'source_url', 'image', 'published_at', 'status']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
