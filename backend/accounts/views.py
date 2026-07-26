from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.db.models import Count
from .serializers import UserSerializer, UserRegistrationSerializer, LoginSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    data = request.data.copy()
    serializer = UserSerializer(request.user, data=data, partial=True)
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
    return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


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
