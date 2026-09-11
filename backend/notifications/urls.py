from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', views.mark_notification_read, name='notification-read'),
    path('read-all/', views.mark_all_read, name='notification-read-all'),
    path('unread-count/', views.unread_count, name='notification-unread-count'),
]