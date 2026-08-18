from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/upload-picture/', views.upload_profile_picture, name='upload_profile_picture'),
    path('profile/remove-picture/', views.remove_profile_picture, name='remove_profile_picture'),
    path('profile/stats/', views.user_stats, name='user_stats'),
    path('profile/liked-news/', views.user_liked_news, name='user_liked_news'),
    path('profile/comments/', views.user_comments, name='user_comments'),
    # Public profiles & follow
    path('users/<int:user_id>/', views.user_public_profile, name='user_public_profile'),
    path('users/<int:user_id>/follow/', views.follow_user, name='follow_user'),
    path('users/<int:user_id>/followers/', views.user_followers, name='user_followers'),
    path('users/<int:user_id>/following/', views.user_following_list, name='user_following_list'),
    path('users/<int:user_id>/news/', views.user_news, name='user_news'),
]
