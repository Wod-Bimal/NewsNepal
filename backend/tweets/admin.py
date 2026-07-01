from django.contrib import admin
from .models import Tweet, Topic, Comment

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    """Admin for Topic model."""
    list_display = ['name', 'description', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    ordering = ['name']

@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    """Admin for news post model."""
    list_display = ['author', 'title', 'topic', 'like_count', 'share_count', 'created_at']
    list_filter = ['topic', 'status', 'created_at']
    search_fields = ['title', 'summary', 'content', 'author__username']
    ordering = ['-created_at']
    readonly_fields = ['like_count', 'share_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        return obj.summary[:50] + '...' if obj.summary else obj.content[:50] + '...'
    content_preview.short_description = 'Preview'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Admin for Comment model."""
    list_display = ['author', 'tweet', 'content_preview', 'like_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username', 'tweet__content']
    ordering = ['-created_at']
    readonly_fields = ['like_count', 'created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:30] + '...' if len(obj.content) > 30 else obj.content
    content_preview.short_description = 'Content'