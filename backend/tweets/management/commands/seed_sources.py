from django.core.management.base import BaseCommand
from tweets.models import NewsSource

SOURCES = [
    {'name': 'Kantipur Daily', 'website_url': 'https://www.kantipurdaily.com', 'bias_rating': 'center', 'credibility_score': 80, 'description': 'Nepal\'s largest-selling national daily newspaper.'},
    {'name': 'Onlinekhabar', 'website_url': 'https://www.onlinekhabar.com', 'bias_rating': 'center', 'credibility_score': 75, 'description': 'Leading Nepali online news portal.'},
    {'name': 'Setopati', 'website_url': 'https://www.setopati.com', 'bias_rating': 'left', 'credibility_score': 65, 'description': 'Nepali news portal with analytical reporting.'},
    {'name': 'Nagarik News', 'website_url': 'https://www.nagariknews.com', 'bias_rating': 'center', 'credibility_score': 70, 'description': 'Nepali daily newspaper and online news.'},
    {'name': 'Annapurna Post', 'website_url': 'https://annapurnapost.com', 'bias_rating': 'center', 'credibility_score': 75, 'description': 'Major Nepali national daily.'},
    {'name': 'The Himalayan Times', 'website_url': 'https://www.thehimalayantimes.com', 'bias_rating': 'center', 'credibility_score': 78, 'description': 'Nepal\'s leading English-language daily.'},
    {'name': 'Ratopati', 'website_url': 'https://www.ratopati.com', 'bias_rating': 'right', 'credibility_score': 55, 'description': 'Nepali news portal.'},
    {'name': 'Nepal News', 'website_url': 'https://nepalnews.com', 'bias_rating': 'center', 'credibility_score': 70, 'description': 'Government-owned national news agency.'},
    {'name': 'Desh Sanchar', 'website_url': 'https://deshsanchar.com', 'bias_rating': 'right_extreme', 'credibility_score': 35, 'description': 'Controversial news portal with extreme right-wing views.'},
    {'name': 'Ujyaalo Online', 'website_url': 'https://ujyaaloonline.com', 'bias_rating': 'center', 'credibility_score': 65, 'description': 'Nepali news and entertainment portal.'},
    {'name': 'Naya Patrika', 'website_url': 'https://www.nayapatrikadaily.com', 'bias_rating': 'left', 'credibility_score': 60, 'description': 'Nepali national daily.'},
    {'name': 'BBC Nepali', 'website_url': 'https://www.bbc.com/nepali', 'bias_rating': 'center', 'credibility_score': 90, 'description': 'BBC News service in Nepali.'},
]


class Command(BaseCommand):
    help = 'Seed Nepali news sources'

    def handle(self, *args, **options):
        for data in SOURCES:
            NewsSource.objects.get_or_create(name=data['name'], defaults=data)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(SOURCES)} news sources'))
