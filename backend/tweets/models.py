from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Topic(models.Model):
    """Model for political topics/categories."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#1DA1F2')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Tweet(models.Model):
    """Model for tweets/posts."""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tweets')
    content = models.TextField(max_length=500)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='tweets')
    image = models.ImageField(upload_to='tweet_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_tweets', blank=True)
    retweets = models.ManyToManyField(User, related_name='retweeted_tweets', blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}..."
    
    @property
    def like_count(self):
        return self.likes.count()
    
    @property
    def retweet_count(self):
        return self.retweets.count()


class Comment(models.Model):
    """Model for tweet comments."""
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.author.username}: {self.content[:30]}..."
    
    @property
    def like_count(self):
        return self.likes.count()