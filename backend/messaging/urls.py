from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet, basename='conversation')
router.register(r'threads', views.ArticleThreadViewSet, basename='thread')

urlpatterns = [
    path('conversations/unread/', views.unread_counts, name='unread-counts'),
    path('users/search/', views.user_search, name='user-search'),
    path('', include(router.urls)),
]
