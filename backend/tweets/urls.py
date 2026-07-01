from django.urls import path
from . import views

app_name = 'tweets'

urlpatterns = [
    path('news/', views.news_list, name='news_list'),
    path('news/create/', views.news_create, name='news_create'),
    path('news/user/<str:username>/', views.user_tweets, name='user_news'),
    path('news/<int:pk>/', views.news_detail, name='news_detail'),
    path('news/<int:pk>/update/', views.news_update, name='news_update'),
    path('news/<int:pk>/delete/', views.news_delete, name='news_delete'),
    path('news/<int:pk>/like/', views.news_like, name='news_like'),
    path('news/<int:pk>/share/', views.news_share, name='news_share'),
    path('comments/create/<int:tweet_pk>/', views.comment_create, name='comment_create'),
    path('comments/<int:pk>/like/', views.comment_like, name='comment_like'),
    path('comments/<int:pk>/delete/', views.comment_delete, name='comment_delete'),
    path('topics/', views.TopicViewSet.as_view({'get': 'list', 'post': 'create'}), name='topic_list'),
    path('topics/<int:pk>/', views.TopicViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='topic_detail'),
    path('topics/<int:pk>/news/', views.topic_tweets, name='topic_news'),
]