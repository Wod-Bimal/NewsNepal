from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.db.models import Count
from .models import User, Follow
from .serializers import UserSerializer, UserPublicSerializer, UserRegistrationSerializer, LoginSerializer


def serialize_user(user, request):
    return UserSerializer(user, context={'request': request}).data


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response(serialize_user(user, request), status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        return Response(serialize_user(user, request), status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(serialize_user(request.user, request))


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    data = request.data.copy()
    serializer = UserSerializer(request.user, data=data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    if 'profile_picture' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    request.user.profile_picture = request.FILES['profile_picture']
    request.user.save()
    return Response(serialize_user(request.user, request), status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_profile_picture(request):
    if request.user.profile_picture:
        request.user.profile_picture.delete(save=False)
        request.user.profile_picture = None
        request.user.save(update_fields=['profile_picture'])
    return Response(serialize_user(request.user, request), status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    user = request.user
    from tweets.models import News, Comment, BiasVote
    news_count = News.objects.filter(author=user).count()
    total_likes_received = News.objects.filter(author=user).aggregate(
        total=Count('likes')
    )['total'] or 0
    comments_made = Comment.objects.filter(author=user).count()
    news_liked = user.liked_news.count()
    bias_votes = BiasVote.objects.filter(user=user).count()

    return Response({
        'news_count': news_count,
        'total_likes_received': total_likes_received,
        'comments_made': comments_made,
        'news_liked': news_liked,
        'bias_votes': bias_votes,
        'followers_count': user.followers_count,
        'following_count': user.following_count,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_liked_news(request):
    from tweets.models import News
    from tweets.serializers import NewsSerializer
    news = request.user.liked_news.all().order_by('-created_at')[:50]
    serializer = NewsSerializer(news, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_comments(request):
    from tweets.models import Comment
    from tweets.serializers import CommentSerializer
    comments = Comment.objects.filter(author=request.user).select_related('news').order_by('-created_at')[:50]
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    return Response(serializer.data)


# --- Public User Profile ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_public_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserPublicSerializer(user, context={'request': request})
    return Response(serializer.data)


# --- Follow / Unfollow ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user == target:
        return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

    follow, created = Follow.objects.get_or_create(follower=request.user, following=target)
    if not created:
        return Response({'error': 'Already following'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'status': 'following',
        'followers_count': target.followers_count,
        'following_count': request.user.following_count,
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, user_id):
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    deleted, _ = Follow.objects.filter(follower=request.user, following=target).delete()
    if not deleted:
        return Response({'error': 'Not following'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'status': 'unfollowed',
        'followers_count': target.followers_count,
        'following_count': request.user.following_count,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_followers(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    followers = Follow.objects.filter(following=user).select_related('follower')
    users = [f.follower for f in followers]
    from .serializers import UserPublicSerializer
    serializer = UserPublicSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_following_list(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    following = Follow.objects.filter(follower=user).select_related('following')
    users = [f.following for f in following]
    from .serializers import UserPublicSerializer
    serializer = UserPublicSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_news(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    from tweets.models import News
    from tweets.serializers import NewsSerializer
    news = News.objects.filter(author=user, status='published').order_by('-created_at')[:50]
    serializer = NewsSerializer(news, many=True, context={'request': request})
    return Response(serializer.data)
