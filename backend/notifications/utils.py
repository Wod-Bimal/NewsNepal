from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
from .serializers import NotificationSerializer


def notify(*, recipient=None, recipient_id=None, actor=None, type=Notification.FOLLOW,
           target_news=None, target_news_id=None, target_comment=None,
           target_comment_id=None, conversation=None, conversation_id=None, content=''):
    """Create a notification and push it over the recipient's WebSocket channel.

    Skips when actor == recipient (no self-notifications).
    """
    recipient_obj = recipient
    if recipient_id is not None:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipient_obj = User.objects.filter(id=recipient_id).first()
    if recipient_obj is None:
        return None
    if actor is not None and actor.id == recipient_obj.id:
        return None

    notification = Notification.objects.create(
        recipient=recipient_obj,
        actor=actor,
        type=type,
        target_news_id=target_news_id if target_news_id is not None else (target_news.id if target_news else None),
        target_comment_id=target_comment_id if target_comment_id is not None else (target_comment.id if target_comment else None),
        conversation_id=conversation_id if conversation_id is not None else (conversation.id if conversation else None),
        content=(content or '')[:500],
    )
    notification.refresh_from_db()

    channel_layer = get_channel_layer()
    if channel_layer is not None:
        payload = NotificationSerializer(notification).data
        async_to_sync(channel_layer.group_send)(
            f'notifications_{recipient_obj.id}',
            {
                'type': 'notification.create',
                'payload': payload,
            },
        )
    return notification