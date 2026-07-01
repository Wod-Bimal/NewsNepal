from rest_framework import status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from .models import Tweet, Topic, Comment
from .serializers import TweetSerializer, TweetCreateSerializer, TopicSerializer, CommentSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def user_tweets(request, username):
    """Get all news posts by a specific user."""
    user = get_object_or_404(User, username=username)
    tweets = Tweet.objects.filter(author=user).select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments')
    serializer = TweetSerializer(tweets, many=True, context={'request': request})
    return Response(serializer.data)


class TopicViewSet(ModelViewSet):
    """ViewSet for managing topics."""
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    pagination_class = None
    
    def get_permissions(self):
        """Allow read access to anyone, but write access only to admins."""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


@api_view(['GET'])
@permission_classes([AllowAny])
def topic_tweets(request, pk):
    """Get news posts for a specific topic."""
    tweets = Tweet.objects.filter(topic_id=pk).select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments')
    serializer = TweetSerializer(tweets, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def news_list(request):
    """Get list of news posts with optional filtering."""
    queryset = Tweet.objects.select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments')
    
    # Filter by topic if provided
    topic_id = request.GET.get('topic')
    if topic_id:
        queryset = queryset.filter(topic_id=topic_id)
    
    # Search functionality
    search = request.GET.get('search')
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(summary__icontains=search) |
            Q(content__icontains=search) |
            Q(author__username__icontains=search) |
            Q(author__first_name__icontains=search) |
            Q(author__last_name__icontains=search)
        )
    
    serializer = TweetSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def news_create(request):
    """Create a new news post."""
    serializer = TweetCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        tweet = serializer.save()
        response_serializer = TweetSerializer(tweet, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def news_update(request, pk):
    """Update a news post."""
    try:
        tweet = Tweet.objects.get(pk=pk)
        if tweet.author != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TweetCreateSerializer(tweet, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_tweet = serializer.save()
            return Response(TweetSerializer(updated_tweet, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Tweet.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def news_detail(request, pk):
    """Get a specific news post."""
    try:
        tweet = Tweet.objects.select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments').get(pk=pk)
        serializer = TweetSerializer(tweet, context={'request': request})
        return Response(serializer.data)
    except Tweet.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def news_delete(request, pk):
    """Delete a news post (only by author)."""
    try:
        tweet = Tweet.objects.get(pk=pk)
        if tweet.author != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        tweet.delete()
        return Response({'message': 'News post deleted successfully'}, status=status.HTTP_200_OK)
    except Tweet.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def news_like(request, pk):
    """Like or unlike a news post."""
    try:
        tweet = Tweet.objects.get(pk=pk)
        if tweet.likes.filter(id=request.user.id).exists():
            tweet.likes.remove(request.user)
            liked = False
        else:
            tweet.likes.add(request.user)
            liked = True
        
        return Response({
            'liked': liked,
            'like_count': tweet.like_count
        }, status=status.HTTP_200_OK)
    except Tweet.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def news_share(request, pk):
    """Share or unshare a news post."""
    try:
        tweet = Tweet.objects.get(pk=pk)
        if tweet.shares.filter(id=request.user.id).exists():
            tweet.shares.remove(request.user)
            shared = False
        else:
            tweet.shares.add(request.user)
            shared = True
        
        return Response({
            'shared': shared,
            'share_count': tweet.share_count
        }, status=status.HTTP_200_OK)
    except Tweet.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_create(request, tweet_pk):
    """Create a comment on a tweet."""
    try:
        tweet = Tweet.objects.get(pk=tweet_pk)
        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            comment = serializer.save(tweet=tweet, author=request.user)
            return Response(CommentSerializer(comment, context={'request': request}).data, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Tweet.DoesNotExist:
        return Response({'error': 'Tweet not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_like(request, pk):
    """Like or unlike a comment."""
    try:
        comment = Comment.objects.get(pk=pk)
        if comment.likes.filter(id=request.user.id).exists():
            comment.likes.remove(request.user)
            liked = False
        else:
            comment.likes.add(request.user)
            liked = True
        
        return Response({
            'liked': liked,
            'like_count': comment.like_count
        }, status=status.HTTP_200_OK)
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def comment_delete(request, pk):
    """Delete a comment (only by author)."""
    try:
        comment = Comment.objects.get(pk=pk)
        if comment.author != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response({'message': 'Comment deleted successfully'}, status=status.HTTP_200_OK)
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)