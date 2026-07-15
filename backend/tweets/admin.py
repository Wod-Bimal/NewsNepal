from django.contrib import admin
from .models import News, Topic, Comment, NewsSource, BiasVote

admin.site.register(News)
admin.site.register(Topic)
admin.site.register(Comment)
admin.site.register(NewsSource)
admin.site.register(BiasVote)
