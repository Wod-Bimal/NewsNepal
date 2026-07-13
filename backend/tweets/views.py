from rest_framework import status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from .models import News, Topic, Comment
from .serializers import NewsSerializer, NewsCreateSerializer, TopicSerializer, CommentSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def user_news(request, username):
    """Get all news posts by a specific user."""
    user = get_object_or_404(User, username=username)
    news_items = News.objects.filter(author=user).select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments')
    serializer = NewsSerializer(news_items, many=True, context={'request': request})
    return Response(serializer.data)


class TopicViewSet(ModelViewSet):
    """ViewSet for managing topics."""
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    pagination_class = None
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


@api_view(['GET'])
@permission_classes([AllowAny])
def topic_news(request, pk):
    """Get news posts for a specific topic."""
    news_items = News.objects.filter(topic_id=pk).select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments')
    serializer = NewsSerializer(news_items, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def news_list(request):
    """Get list of news posts with optional filtering."""
    queryset = News.objects.select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments')
    
    topic_id = request.GET.get('topic')
    if topic_id:
        queryset = queryset.filter(topic_id=topic_id)
    
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
    
    serializer = NewsSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def news_create(request):
    """Create a new news post."""
    serializer = NewsCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        news_item = serializer.save()
        response_serializer = NewsSerializer(news_item, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def news_update(request, pk):
    """Update a news post."""
    try:
        news_item = News.objects.get(pk=pk)
        if news_item.author != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = NewsCreateSerializer(news_item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_news = serializer.save()
            return Response(NewsSerializer(updated_news, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except News.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def news_detail(request, pk):
    """Get a specific news post."""
    try:
        news_item = News.objects.select_related('author', 'topic').prefetch_related('likes', 'shares', 'comments').get(pk=pk)
        serializer = NewsSerializer(news_item, context={'request': request})
        return Response(serializer.data)
    except News.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def news_delete(request, pk):
    """Delete a news post (only by author)."""
    try:
        news_item = News.objects.get(pk=pk)
        if news_item.author != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        news_item.delete()
        return Response({'message': 'News post deleted successfully'}, status=status.HTTP_200_OK)
    except News.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def news_like(request, pk):
    """Like or unlike a news post."""
    try:
        news_item = News.objects.get(pk=pk)
        if news_item.likes.filter(id=request.user.id).exists():
            news_item.likes.remove(request.user)
            liked = False
        else:
            news_item.likes.add(request.user)
            liked = True
        
        return Response({
            'liked': liked,
            'like_count': news_item.like_count
        }, status=status.HTTP_200_OK)
    except News.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def news_share(request, pk):
    """Share or unshare a news post."""
    try:
        news_item = News.objects.get(pk=pk)
        if news_item.shares.filter(id=request.user.id).exists():
            news_item.shares.remove(request.user)
            shared = False
        else:
            news_item.shares.add(request.user)
            shared = True
        
        return Response({
            'shared': shared,
            'share_count': news_item.share_count
        }, status=status.HTTP_200_OK)
    except News.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_create(request, news_pk):
    """Create a comment on a news post."""
    try:
        news_item = News.objects.get(pk=news_pk)
        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            comment = serializer.save(news=news_item, author=request.user)
            return Response(CommentSerializer(comment, context={'request': request}).data, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except News.DoesNotExist:
        return Response({'error': 'News post not found'}, status=status.HTTP_404_NOT_FOUND)


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
