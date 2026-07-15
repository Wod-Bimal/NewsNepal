from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

BIAS_CHOICES = [
    ('center', 'Centrist'),
    ('left', 'Leaning Left'),
    ('right', 'Leaning Right'),
    ('left_extreme', 'Far Left'),
    ('right_extreme', 'Far Right'),
    ('sensationalist', 'Sensationalist'),
    ('unknown', 'Unknown'),
]


class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#1DA1F2')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ['name']
    def __str__(self): return self.name


class NewsSource(models.Model):
    name = models.CharField(max_length=200)
    website_url = models.URLField(max_length=500)
    logo = models.ImageField(upload_to='source_logos/', null=True, blank=True)
    bias_rating = models.CharField(max_length=20, choices=BIAS_CHOICES, default='unknown')
    credibility_score = models.IntegerField(default=50, help_text='0-100')
    country = models.CharField(max_length=100, default='Nepal')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ['name']
    def __str__(self): return self.name


class News(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news')
    title = models.CharField(max_length=255)
    summary = models.TextField(max_length=500, blank=True)
    content = models.TextField(max_length=500)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='news')
    source = models.ForeignKey(NewsSource, on_delete=models.SET_NULL, null=True, blank=True, related_name='news')
    source_url = models.URLField(max_length=500, blank=True, null=True)
    image = models.ImageField(upload_to='news_images/', null=True, blank=True)
    published_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=20, choices=[('draft', 'Draft'), ('published', 'Published')], default='published'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_news', blank=True)
    shares = models.ManyToManyField(User, related_name='shared_news', blank=True)

    class Meta: ordering = ['-created_at']
    def __str__(self): return f"{self.author.username}: {self.title[:50]}..."

    @property
    def like_count(self): return self.likes.count()
    @property
    def share_count(self): return self.shares.count()

    @property
    def bias_summary(self):
        votes = self.bias_votes.all()
        if not votes:
            if self.source and self.source.bias_rating != 'unknown':
                return {'source_rating': self.source.bias_rating, 'community': None, 'total_votes': 0}
            return {'source_rating': None, 'community': None, 'total_votes': 0}
        counts = {}
        for v in votes: counts[v.rating] = counts.get(v.rating, 0) + 1
        top = max(counts, key=counts.get) if counts else None
        src = self.source.bias_rating if self.source and self.source.bias_rating != 'unknown' else None
        return {'source_rating': src, 'community': top, 'total_votes': votes.count()}


class Comment(models.Model):
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    class Meta: ordering = ['created_at']
    def __str__(self): return f"{self.author.username}: {self.content[:30]}..."
    @property
    def like_count(self): return self.likes.count()


class BiasVote(models.Model):
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name='bias_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.CharField(max_length=20, choices=BIAS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = ('news', 'user')
    def __str__(self): return f"{self.user.username}: {self.rating} on {self.news.id}"
