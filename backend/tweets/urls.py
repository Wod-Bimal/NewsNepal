from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'topics', views.TopicViewSet, basename='topic')
router.register(r'news', views.NewsViewSet, basename='news')
router.register(r'news/(?P<news_pk>[^/.]+)/comments', views.CommentViewSet, basename='comment')
router.register(r'sources', views.NewsSourceViewSet, basename='source')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.me_view, name='me'),
    path('news/<int:pk>/like/', views.toggle_like, name='news-like'),
    path('news/<int:news_pk>/comments/<int:pk>/like/', views.toggle_comment_like, name='comment-like'),
    path('news/<int:news_id>/bias/', views.bias_vote, name='bias-vote'),
]
