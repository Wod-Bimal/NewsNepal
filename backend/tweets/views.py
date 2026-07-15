from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from .models import News, Topic, Comment, NewsSource, BiasVote
from .serializers import (
    UserSerializer, RegisterSerializer, TopicSerializer,
    NewsSerializer, CommentSerializer, NewsSourceSerializer,
    NewsSourceDetailSerializer, BiasVoteSerializer
)

User = get_user_model()


def safe_user(request):
    return request.user if request.user.is_authenticated else None


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def perform_create(self, serializer):
        user = serializer.save()
        login(self.request, user)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        return Response(UserSerializer(user).data)
    return Response({'error': 'Invalid credentials'}, status=400)


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out'})


@api_view(['GET'])
def me_view(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({'error': 'Not logged in'}, status=401)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class NewsViewSet(viewsets.ModelViewSet):
    serializer_class = NewsSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = News.objects.filter(status='published').select_related('author', 'topic', 'source')
        qs = qs.prefetch_related('comments__author', 'likes', 'bias_votes')

        topic = self.request.query_params.get('topic')
        if topic: qs = qs.filter(topic__name__iexact=topic)

        search = self.request.query_params.get('search')
        if search: qs = qs.filter(Q(title__icontains=search) | Q(content__icontains=search))

        source = self.request.query_params.get('source')
        if source: qs = qs.filter(source_id=source)

        bias = self.request.query_params.get('bias')
        if bias and bias != 'all':
            qs = qs.filter(source__bias_rating=bias)

        sort = self.request.query_params.get('sort', '-created_at')
        if sort == 'most_liked': qs = qs.annotate(lcount=Count('likes')).order_by('-lcount')
        elif sort == 'most_commented': qs = qs.annotate(ccount=Count('comments')).order_by('-ccount')
        else: qs = qs.order_by(sort)

        return qs

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Comment.objects.filter(news_id=self.kwargs.get('news_pk')).select_related('author')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, news_id=self.kwargs.get('news_pk'))

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class NewsSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NewsSource.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return NewsSourceDetailSerializer
        return NewsSourceSerializer


@api_view(['POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def bias_vote(request, news_id):
    try:
        news = News.objects.get(id=news_id)
    except News.DoesNotExist:
        return Response({'error': 'News not found'}, status=404)

    if request.method == 'POST':
        rating = request.data.get('rating')
        if rating not in dict(BiasVote._meta.get_field('rating').choices):
            return Response({'error': 'Invalid rating'}, status=400)
        vote, created = BiasVote.objects.update_or_create(
            news=news, user=request.user, defaults={'rating': rating}
        )
        return Response(BiasVoteSerializer(vote).data, status=201 if created else 200)

    elif request.method == 'DELETE':
        BiasVote.objects.filter(news=news, user=request.user).delete()
        return Response(status=204)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, pk):
    news = generics.get_object_or_404(News, pk=pk)
    if news.likes.filter(id=request.user.id).exists():
        news.likes.remove(request.user)
        return Response({'liked': False, 'count': news.like_count})
    news.likes.add(request.user)
    return Response({'liked': True, 'count': news.like_count})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_comment_like(request, news_pk, pk):
    comment = generics.get_object_or_404(Comment, pk=pk)
    if comment.likes.filter(id=request.user.id).exists():
        comment.likes.remove(request.user)
        return Response({'liked': False, 'count': comment.like_count})
    comment.likes.add(request.user)
    return Response({'liked': True, 'count': comment.like_count})
