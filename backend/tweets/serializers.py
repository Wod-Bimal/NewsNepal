from rest_framework import serializers
from accounts.models import User
from .models import Tweet, Topic, Comment


class TopicSerializer(serializers.ModelSerializer):
    """Serializer for Topic model."""
    tweet_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'color', 'created_at', 'tweet_count']
        read_only_fields = ['id', 'created_at']
    
    def get_tweet_count(self, obj):
        return obj.tweets.count()


class UserSerializer(serializers.ModelSerializer):
    """Simplified user serializer for tweets."""
    
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


class TweetSerializer(serializers.ModelSerializer):
    """Serializer for Tweet model."""
    author = UserSerializer(read_only=True)
    topic = TopicSerializer(read_only=True)
    like_count = serializers.ReadOnlyField()
    share_count = serializers.ReadOnlyField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_shared = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Tweet
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


class TweetCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating news posts."""
    
    class Meta:
        model = Tweet
        fields = ['title', 'summary', 'content', 'topic', 'source_url', 'image', 'published_at', 'status']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)