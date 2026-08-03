from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from .models import Topic
from .serializers import NewsSerializer


class NewsSerializerTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='tester',
            email='tester@example.com',
            password='password123'
        )
        self.topic = Topic.objects.create(name='Test Topic')
        self.factory = APIRequestFactory()

    def test_create_uses_content_as_title_when_title_missing(self):
        request = self.factory.post('/api/news/', {'content': 'A sample content for testing'})
        request.user = self.user

        serializer = NewsSerializer(
            data={'content': 'A sample content for testing', 'topic_id': self.topic.id},
            context={'request': request}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        news = serializer.save()

        self.assertEqual(news.title, 'A sample content for testing')
        self.assertEqual(news.author, self.user)
