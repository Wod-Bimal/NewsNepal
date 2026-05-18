from django.urls import path
from . import views

app_name = 'tweets'

urlpatterns = [
    path('tweets/', views.tweet_list, name='tweet_list'),
    path('tweets/create/', views.tweet_create, name='tweet_create'),
    path('tweets/user/<str:username>/', views.user_tweets, name='user_tweets'),
    path('tweets/<int:pk>/', views.tweet_detail, name='tweet_detail'),
    path('tweets/<int:pk>/update/', views.tweet_update, name='tweet_update'),
    path('tweets/<int:pk>/delete/', views.tweet_delete, name='tweet_delete'),
    path('tweets/<int:pk>/like/', views.tweet_like, name='tweet_like'),
    path('tweets/<int:pk>/retweet/', views.tweet_retweet, name='tweet_retweet'),
    path('comments/create/<int:tweet_pk>/', views.comment_create, name='comment_create'),
    path('comments/<int:pk>/like/', views.comment_like, name='comment_like'),
    path('comments/<int:pk>/delete/', views.comment_delete, name='comment_delete'),
    path('topics/', views.TopicViewSet.as_view({'get': 'list', 'post': 'create'}), name='topic_list'),
    path('topics/<int:pk>/', views.TopicViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='topic_detail'),
    path('topics/<int:pk>/tweets/', views.topic_tweets, name='topic_tweets'),
]