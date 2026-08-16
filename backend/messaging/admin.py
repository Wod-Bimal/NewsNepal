from django.contrib import admin
from .models import Conversation, ConversationParticipant, Message, ArticleThread, ArticleThreadMessage


class ConversationParticipantInline(admin.TabularInline):
    model = ConversationParticipant
    extra = 0


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'is_group', 'created_by', 'created_at']
    list_filter = ['is_group']
    inlines = [ConversationParticipantInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'author', 'content', 'created_at']
    list_filter = ['created_at']


@admin.register(ArticleThread)
class ArticleThreadAdmin(admin.ModelAdmin):
    list_display = ['id', 'news', 'created_at']


@admin.register(ArticleThreadMessage)
class ArticleThreadMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'thread', 'author', 'content', 'created_at']
