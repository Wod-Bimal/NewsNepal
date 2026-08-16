from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Max
from .models import Conversation, ConversationParticipant, Message, ArticleThread, ArticleThreadMessage
from .serializers import (
    ConversationListSerializer, ConversationDetailSerializer,
    CreateConversationSerializer, MessageSerializer,
    ArticleThreadSerializer, ThreadMessageSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants__user=self.request.user
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationListSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data
        participant_ids = data.pop('participant_ids', [])
        conversation = serializer.save(created_by=self.request.user)
        all_ids = list(set(participant_ids + [self.request.user.id]))
        for uid in all_ids:
            ConversationParticipant.objects.create(conversation=conversation, user_id=uid)

    def create(self, request, *args, **kwargs):
        serializer = CreateConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        participant_ids = data.get('participant_ids', [])
        is_group = data.get('is_group', False)
        title = data.get('title', '')

        if not is_group:
            all_ids = list(set(participant_ids + [request.user.id]))
            if len(all_ids) == 2:
                existing = Conversation.objects.filter(
                    is_group=False,
                    participants__user_id=all_ids[0],
                ).filter(
                    participants__user_id=all_ids[1]
                ).distinct()
                if existing.exists():
                    conv = existing.first()
                    return Response(
                        ConversationListSerializer(conv, context={'request': request}).data,
                        status=status.HTTP_200_OK
                    )

        conv = Conversation.objects.create(
            title=title, is_group=is_group, created_by=request.user
        )
        all_ids = list(set(participant_ids + [request.user.id]))
        for uid in all_ids:
            ConversationParticipant.objects.create(conversation=conv, user_id=uid)

        return Response(
            ConversationDetailSerializer(conv, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        content = request.data.get('content', '').strip()
        shared_news_id = request.data.get('shared_news_id')

        if not content and not shared_news_id:
            return Response({'error': 'Message content or shared_news_id required'},
                          status=status.HTTP_400_BAD_REQUEST)

        from tweets.models import News
        shared_news = None
        if shared_news_id:
            try:
                shared_news = News.objects.get(id=shared_news_id)
            except News.DoesNotExist:
                return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)

        msg = Message.objects.create(
            conversation=conversation,
            author=request.user,
            content=content,
            shared_news=shared_news
        )

        conversation.save()

        return Response(
            MessageSerializer(msg).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        from django.utils import timezone
        participant, _ = ConversationParticipant.objects.get_or_create(
            conversation=conversation, user=request.user
        )
        participant.last_read_at = timezone.now()
        participant.save(update_fields=['last_read_at'])
        return Response({'status': 'marked as read'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_participant(self, request, pk=None):
        conversation = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        participant, created = ConversationParticipant.objects.get_or_create(
            conversation=conversation, user_id=user_id
        )
        if not created:
            return Response({'error': 'User already in conversation'},
                          status=status.HTTP_400_BAD_REQUEST)
        return Response({'status': 'participant added'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_participant(self, request, pk=None):
        conversation = self.get_object()
        user_id = request.data.get('user_id') or request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = ConversationParticipant.objects.filter(
            conversation=conversation, user_id=user_id
        ).delete()
        if not deleted:
            return Response({'error': 'User not in conversation'},
                          status=status.HTTP_404_NOT_FOUND)
        return Response({'status': 'participant removed'})


class ArticleThreadViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ArticleThread.objects.all()

    @action(detail=False, methods=['get', 'post'], url_path=r'news/(?P<news_id>\d+)')
    def by_news(self, request, news_id=None):
        from tweets.models import News
        try:
            news = News.objects.get(id=news_id)
        except News.DoesNotExist:
            return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            thread, _ = ArticleThread.objects.get_or_create(news=news)
            return Response(ArticleThreadSerializer(thread, context={'request': request}).data)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Content required'}, status=status.HTTP_400_BAD_REQUEST)

        thread, _ = ArticleThread.objects.get_or_create(news=news)
        msg = ArticleThreadMessage.objects.create(
            thread=thread, author=request.user, content=content
        )
        return Response(ThreadMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_counts(request):
    conversations = Conversation.objects.filter(participants__user=request.user)
    counts = {}
    for conv in conversations:
        participant = conv.participants.filter(user=request.user).first()
        if not participant or not participant.last_read_at:
            count = conv.messages.exclude(author=request.user).count()
        else:
            count = conv.messages.exclude(author=request.user).filter(
                created_at__gt=participant.last_read_at
            ).count()
        if count > 0:
            counts[conv.id] = count
    return Response(counts)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_search(request):
    query = request.query_params.get('q', '').strip()
    if len(query) < 2:
        return Response([])
    from accounts.models import User
    users = User.objects.filter(
        Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query)
    ).exclude(id=request.user.id)[:10]
    from accounts.serializers import UserSerializer
    return Response(UserSerializer(users, many=True).data)
