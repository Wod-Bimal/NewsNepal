from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Follow


class UserSerializer(serializers.ModelSerializer):
    """Serializer for current user (full profile)."""
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'bio', 'location', 'birth_date', 'profile_picture', 
                 'created_at', 'updated_at', 'is_staff', 'is_superuser',
                 'followers_count', 'following_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_staff', 'is_superuser',
                           'followers_count', 'following_count']


class UserPublicSerializer(serializers.ModelSerializer):
    """Serializer for viewing other users' profiles."""
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField()
    is_followed_by = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'bio', 'location',
                 'profile_picture', 'created_at', 'followers_count', 'following_count',
                 'is_following', 'is_followed_by', 'posts_count']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=request.user, following=obj).exists()

    def get_is_followed_by(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=obj, following=request.user).exists()

    def get_posts_count(self, obj):
        return obj.news.count()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'bio', 'location', 'birth_date']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password.')
        
        return attrs
