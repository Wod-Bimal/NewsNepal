import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope.get('user', AnonymousUser())

        if self.user.is_anonymous:
            await self.close()
            return

        is_participant = await self.check_participant()
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type', 'message')

        if msg_type == 'message':
            content = data.get('content', '').strip()
            shared_news_id = data.get('shared_news_id')

            if not content and not shared_news_id:
                return

            message = await self.save_message(content, shared_news_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'chat_message', 'message': message}
            )
        elif msg_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user': self.user.username,
                    'is_typing': data.get('is_typing', False),
                }
            )
        elif msg_type == 'read':
            await self.mark_read()
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'read_receipt', 'user': self.user.username}
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
        }))

    async def typing_indicator(self, event):
        if event['user'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user': event['user'],
                'is_typing': event['is_typing'],
            }))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read',
            'user': event['user'],
        }))

    @database_sync_to_async
    def check_participant(self):
        from .models import ConversationParticipant
        return ConversationParticipant.objects.filter(
            conversation_id=self.conversation_id,
            user=self.user
        ).exists()

    @database_sync_to_async
    def save_message(self, content, shared_news_id=None):
        from .models import Message, Conversation
        from tweets.models import News

        shared_news = None
        if shared_news_id:
            try:
                shared_news = News.objects.get(id=shared_news_id)
            except News.DoesNotExist:
                pass

        msg = Message.objects.create(
            conversation_id=self.conversation_id,
            author=self.user,
            content=content,
            shared_news=shared_news,
        )
        Conversation.objects.filter(id=self.conversation_id).update(
            updated_at=msg.created_at
        )

        shared_news_data = None
        if shared_news:
            shared_news_data = {'id': shared_news.id, 'title': shared_news.title}

        return {
            'id': msg.id,
            'conversation': self.conversation_id,
            'author': {
                'id': self.user.id,
                'username': self.user.username,
                'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None,
            },
            'content': msg.content,
            'shared_news': shared_news_data,
            'created_at': msg.created_at.isoformat(),
        }

    @database_sync_to_async
    def mark_read(self):
        from .models import ConversationParticipant
        from django.utils import timezone
        ConversationParticipant.objects.filter(
            conversation_id=self.conversation_id,
            user=self.user
        ).update(last_read_at=timezone.now())


class ArticleThreadConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.news_id = self.scope['url_route']['kwargs']['news_id']
        self.room_group_name = f'thread_{self.news_id}'
        self.user = self.scope.get('user', AnonymousUser())

        if self.user.is_anonymous:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type', 'message')

        if msg_type == 'message':
            content = data.get('content', '').strip()
            if not content:
                return

            message = await self.save_thread_message(content)
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'thread_message', 'message': message}
            )
        elif msg_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user': self.user.username,
                    'is_typing': data.get('is_typing', False),
                }
            )

    async def thread_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
        }))

    async def typing_indicator(self, event):
        if event['user'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user': event['user'],
                'is_typing': event['is_typing'],
            }))

    @database_sync_to_async
    def save_thread_message(self, content):
        from .models import ArticleThread, ArticleThreadMessage
        from tweets.models import News

        news = News.objects.get(id=self.news_id)
        thread, _ = ArticleThread.objects.get_or_create(news=news)
        msg = ArticleThreadMessage.objects.create(
            thread=thread, author=self.user, content=content
        )
        return {
            'id': msg.id,
            'author': {
                'id': self.user.id,
                'username': self.user.username,
                'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None,
            },
            'content': msg.content,
            'created_at': msg.created_at.isoformat(),
        }
