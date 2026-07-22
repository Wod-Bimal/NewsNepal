from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tweets.models import News, Topic, NewsSource

User = get_user_model()

NEWS_DATA = [
    {
        'title': 'Constitution Amendment Bill Tabled in Parliament',
        'content': 'The government has officially tabled a constitution amendment bill in the Federal Parliament today, aiming to address long-standing demands from marginalized communities. Opposition parties have expressed mixed reactions.',
        'topic': 'Politics',
        'source': 'Kantipur Daily',
        'bias_rating': 'center',
    },
    {
        'title': 'Floods Displace Thousands in Terai Region',
        'content': 'Heavy monsoon rains have caused severe flooding in the Terai region, displacing over 12,000 people. Relief camps have been set up in Chitwan, Bara, and Rautahat districts.',
        'topic': 'Disaster',
        'source': 'Onlinekhabar',
        'bias_rating': 'center',
    },
    {
        'title': 'Nepal Trade Deficit Widens to Record High',
        'content': 'Nepal\'s trade deficit has reached a record NPR 1.2 trillion in the current fiscal year, with imports surging while exports remain stagnant. Economists warn of growing dependency on Indian and Chinese markets.',
        'topic': 'Economy',
        'source': 'The Himalayan Times',
        'bias_rating': 'center',
    },
    {
        'title': 'Government Announces Free Vaccination Drive for Children',
        'content': 'The Ministry of Health has announced a nationwide free vaccination campaign targeting children under 5, focusing on measles and rubella. The campaign will begin next month across all 77 districts.',
        'topic': 'Health',
        'source': 'Nagarik News',
        'bias_rating': 'center',
    },
    {
        'title': 'Nepal Army Rescues 47 Trekkers Stranded in Annapurna',
        'content': 'The Nepal Army successfully rescued 47 trekkers stranded near Annapurna Base Camp after unexpected snowfall blocked trail access. The rescue operation lasted over 18 hours.',
        'topic': 'Tourism',
        'source': 'Annapurna Post',
        'bias_rating': 'center',
    },
    {
        'title': 'Student Protests Erupt Over University Fee Hike',
        'content': 'Thousands of students across Tribhuvan University campuses have taken to the streets protesting a proposed 30% tuition fee increase. Police deployed in riot gear near the main gate.',
        'topic': 'Politics',
        'source': 'Setopati',
        'bias_rating': 'left',
    },
    {
        'title': 'New Hydropower Project to Add 900MW to National Grid',
        'content': 'The Upper Marsyangdi Hydropower Project is expected to be fully operational by 2027, adding 900MW to Nepal\'s national grid. The project is a joint venture between Nepal and India.',
        'topic': 'Economy',
        'source': 'Kantipur Daily',
        'bias_rating': 'center',
    },
    {
        'title': 'Kathmandu Metro Introduces Electric Buses on 5 New Routes',
        'content': 'Kathmandu Metropolitan City has launched 20 new electric buses on 5 routes, aiming to reduce air pollution. The routes cover Ratna Park to Bhaktapur, Baneshwor to Lagankhel, and others.',
        'topic': 'Environment',
        'source': 'Onlinekhabar',
        'bias_rating': 'center',
    },
    {
        'title': 'NEA Warns of Power Cuts Due to Low Water Levels',
        'content': 'Nepal Electricity Authority has warned of scheduled power cuts in January due to declining water levels in major hydropower reservoirs. Load shedding may last up to 8 hours daily in some areas.',
        'topic': 'Economy',
        'source': 'Ratopati',
        'bias_rating': 'right',
    },
    {
        'title': 'India-Nepal Border Trade Agreement Renewed for 5 Years',
        'content': 'Nepal and India have renewed their bilateral trade agreement for another 5 years, ensuring continued preferential trade access. The agreement covers over 200 items including jute, cardamom, and ginger.',
        'topic': 'Politics',
        'source': 'BBC Nepali',
        'bias_rating': 'center',
    },
    {
        'title': 'Nepal U-19 Cricket Team Qualifies for World Cup',
        'content': 'Nepal\'s Under-19 cricket team has qualified for the ICC U-19 World Cup after defeating UAE by 6 wickets in the Asia Qualifier final held in Malaysia.',
        'topic': 'Sports',
        'source': 'Annapurna Post',
        'bias_rating': 'center',
    },
    {
        'title': 'Kathmandu Valley Air Quality Reaches Dangerous Levels',
        'content': 'Air quality in the Kathmandu Valley has deteriorated to hazardous levels with PM2.5 readings exceeding 300. Health officials advise residents to avoid outdoor activities.',
        'topic': 'Environment',
        'source': 'Nagarik News',
        'bias_rating': 'center',
    },
    {
        'title': 'Corruption Scandal Rocks Public Service Commission',
        'content': 'Leaked documents reveal irregularities in the recent Public Service Commission examination, with allegations of leaked question papers and manipulated answer sheets. CIAA has launched an investigation.',
        'topic': 'Politics',
        'source': 'Naya Patrika',
        'bias_rating': 'left',
    },
    {
        'title': 'Tourism Numbers Rebound to Pre-COVID Levels',
        'content': 'Nepal welcomed over 1 million tourists this year, surpassing pre-pandemic levels for the first time. Trekking and mountaineering permits saw a 40% increase compared to last year.',
        'topic': 'Tourism',
        'source': 'The Himalayan Times',
        'bias_rating': 'center',
    },
    {
        'title': 'Government Plans National ID Card Digitization',
        'content': 'The government has announced plans to digitize all national ID cards by 2028, integrating citizen services into a single digital platform. The project will cost an estimated NPR 5 billion.',
        'topic': 'Technology',
        'source': 'Ujyaalo Online',
        'bias_rating': 'center',
    },
]


class Command(BaseCommand):
    help = 'Seed sample news posts'

    def handle(self, *args, **options):
        user, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@newsnepal.com', 'is_staff': True, 'is_superuser': True}
        )
        if not user.has_usable_password():
            user.set_password('admin123')
            user.save()

        poster, _ = User.objects.get_or_create(
            username='newsreporter',
            defaults={'email': 'reporter@newsnepal.com'}
        )
        if not poster.has_usable_password():
            poster.set_password('reporter123')
            poster.save()

        for item in NEWS_DATA:
            topic, _ = Topic.objects.get_or_create(name=item['topic'])
            source = NewsSource.objects.filter(name=item['source']).first()
            author = poster if item['topic'] != 'Politics' else user

            News.objects.get_or_create(
                title=item['title'],
                defaults={
                    'content': item['content'],
                    'summary': item['content'][:120] + '...',
                    'author': author,
                    'topic': topic,
                    'source': source,
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Seeded {len(NEWS_DATA)} news posts'))
