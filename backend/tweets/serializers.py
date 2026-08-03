from rest_framework import serializers
from .models import News, Topic, Comment, NewsSource, BiasVote
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'bio', 'location', 'profile_picture', 'date_joined', 'is_staff')
        read_only_fields = ('id', 'date_joined', 'is_staff')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, data):
        return User.objects.create_user(**data)


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'


class NewsSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsSource
        fields = ('id', 'name', 'website_url', 'logo', 'bias_rating', 'credibility_score', 'country', 'description', 'is_active')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['bias_label'] = instance.get_bias_rating_display()
        return data


class NewsSourceDetailSerializer(serializers.ModelSerializer):
    bias_distribution = serializers.SerializerMethodField()

    class Meta:
        model = NewsSource
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['bias_label'] = instance.get_bias_rating_display()
        return data

    def get_bias_distribution(self, obj):
        from django.db.models import Count
        votes = BiasVote.objects.filter(news__source=obj).values('rating').annotate(count=Count('id'))
        return {v['rating']: v['count'] for v in votes}


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.ReadOnlyField()
    has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'news', 'author', 'content', 'created_at', 'updated_at', 'like_count', 'has_liked')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False


class NewsSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    topic = TopicSerializer(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='topic'
    )
    comments = CommentSerializer(many=True, read_only=True)
    like_count = serializers.ReadOnlyField()
    share_count = serializers.ReadOnlyField()
    has_liked = serializers.SerializerMethodField()
    bias_summary = serializers.ReadOnlyField()
    source = NewsSourceSerializer(read_only=True)
    source_id = serializers.PrimaryKeyRelatedField(
        queryset=NewsSource.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='source'
    )
    title = serializers.CharField(required=False, allow_blank=True, max_length=255)

    class Meta:
        model = News
        fields = ('id', 'author', 'title', 'summary', 'content', 'topic', 'topic_id',
                  'source', 'source_id', 'source_url', 'image', 'published_at', 'status',
                  'created_at', 'updated_at', 'like_count', 'share_count', 'has_liked', 'comments',
                  'bias_summary')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not attrs.get('title') and attrs.get('content'):
            attrs['title'] = attrs['content'][:255]
        return attrs

    def create(self, data):
        data['author'] = self.context['request'].user
        return super().create(data)


class BiasVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiasVote
        fields = ('id', 'news', 'rating', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, data):
        data['user'] = self.context['request'].user
        vote, created = BiasVote.objects.update_or_create(
            news=data['news'], user=data['user'], defaults={'rating': data['rating']}
        )
        return vote
