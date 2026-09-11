from django.conf import settings
from django.db import models


class Notification(models.Model):
    FOLLOW = 'follow'
    LIKE = 'like'
    COMMENT = 'comment'
    POST = 'post'
    MESSAGE = 'message'
    THREAD_MESSAGE = 'thread_message'

    TYPE_CHOICES = [
        (FOLLOW, 'Follow'),
        (LIKE, 'Like'),
        (COMMENT, 'Comment'),
        (POST, 'Post'),
        (MESSAGE, 'Message'),
        (THREAD_MESSAGE, 'Thread message'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='+',
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    target_news = models.ForeignKey(
        'tweets.News',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='+',
    )
    target_comment = models.ForeignKey(
        'tweets.Comment',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='+',
    )
    conversation = models.ForeignKey(
        'messaging.Conversation',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='+',
    )
    content = models.CharField(max_length=500, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f'{self.type}: {self.actor} -> {self.recipient}'