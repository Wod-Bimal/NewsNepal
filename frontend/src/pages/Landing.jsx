import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import styled from 'styled-components';
import NewsCard from '../components/NewsCard.jsx';
import { newsService, topicService } from '../services/api.js';

const Container = styled.div`
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #F7F9FA 0%, #EAF2F8 100%);
  padding: 40px 20px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (min-width: 900px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Logo = styled.h1`
  font-size: 48px;
  color: #1DA1F2;
  margin-bottom: 12px;
`;

const Tagline = styled.h2`
  font-size: 32px;
  color: #14171A;
  line-height: 1.1;
  margin-bottom: 20px;
`;

const Description = styled.p`
  color: #657786;
  font-size: 17px;
  line-height: 1.8;
  margin-bottom: 28px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const PrimaryButton = styled(Link)`
  background: #1DA1F2;
  color: white;
  padding: 14px 22px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover { background: #1991DB; }
`;

const SecondaryButton = styled(Link)`
  background: white;
  color: #1DA1F2;
  padding: 14px 22px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  border: 1px solid #1DA1F2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { background: #F7F9FA; }
`;

const HeroDetails = styled.div`
  background: #F7FBFF;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const DetailHeading = styled.h3`
  font-size: 20px;
  margin-bottom: 18px;
  color: #14171A;
`;

const DetailText = styled.p`
  color: #657786;
  line-height: 1.7;
`;

const PreviewGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  @media (min-width: 900px) {
    grid-template-columns: 2fr 0.95fr;
  }
`;

const NewsPreview = styled.div`
  display: grid;
  gap: 20px;
`;

const SectionHeading = styled.h3`
  font-size: 24px;
  color: #14171A;
  margin-bottom: 16px;
`;

const NewsList = styled.div`
  display: grid;
  gap: 18px;
`;

const Sidebar = styled.div`
  display: grid;
  gap: 20px;
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E1E8ED;
`;

const TopicsList = styled.div`
  display: grid;
  gap: 10px;
`;

const TopicChip = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: #F7F9FC;
  color: #14171A;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;

  &:hover { background: #E8F2FF; }
`;

const PreviewCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E1E8ED;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.04);
`;

const PreviewTitle = styled.h4`
  font-size: 18px;
  margin-bottom: 12px;
  color: #14171A;
`;

const PreviewText = styled.p`
  color: #657786;
  line-height: 1.7;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E1E8ED;
`;

const Feature = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 28px;
  margin-bottom: 12px;
`;

const FeatureText = styled.div`
  font-size: 14px;
  color: #657786;
  font-weight: 600;
`;

const SmallNote = styled.p`
  color: #657786;
  font-size: 14px;
  line-height: 1.7;
  margin-top: 12px;
`;

const EmptyState = styled.div`
  background: #FFFFFF;
  border: 1px solid #E1E8ED;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  color: #657786;
`;

const Landing = () => {
  const { user, isAuthenticated } = useAuth();
  const [relatedNews, setRelatedNews] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [error, setError] = useState(null);

  const fetchRelatedNews = useCallback(async () => {
    setLoadingNews(true);
    setError(null);
    try {
      const response = await newsService.getNews({ sort: 'most_liked', page: 1 });
      const data = response.data.results || response.data;
      setRelatedNews(data.slice(0, 5));
    } catch {
      setError('Unable to load your related news. Please refresh the page.');
    } finally {
      setLoadingNews(false);
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await topicService.getTopics();
      setTopics(response.data.results || response.data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRelatedNews();
      fetchTopics();
    }
  }, [isAuthenticated, fetchRelatedNews, fetchTopics]);

  if (isAuthenticated) {
    return (
      <Container>
        <Content>
          <Hero>
            <HeroCopy>
              <Logo>Welcome back, {user?.first_name || user?.username || 'reader'}!</Logo>
              <Tagline>News matched to your interests and the latest trending stories.</Tagline>
              <Description>
                We surface the most relevant updates from Nepal, including top stories, trending topics, and the voices that matter.
                Start exploring your feed, share your own perspective, or dive into the latest coverage.
              </Description>
              <ButtonGroup>
                <PrimaryButton to="/feed">Open Feed</PrimaryButton>
                <SecondaryButton to="/create">Share News</SecondaryButton>
              </ButtonGroup>
            </HeroCopy>

            <HeroDetails>
              <DetailHeading>Your related news right now</DetailHeading>
              <DetailText>
                This preview is based on popular and high-quality stories across the site. Visit your feed to see more personalized content.
              </DetailText>
            </HeroDetails>
          </Hero>

          <PreviewGrid>
            <NewsPreview>
              <SectionHeading>Related News</SectionHeading>
              {loadingNews ? (
                <EmptyState>Loading related news…</EmptyState>
              ) : error ? (
                <EmptyState>{error}</EmptyState>
              ) : relatedNews.length === 0 ? (
                <EmptyState>No news available right now. Check back soon or add a post.</EmptyState>
              ) : (
                <NewsList>
                  {relatedNews.map((item) => (
                    <NewsCard key={item.id} newsItem={item} onUpdate={fetchRelatedNews} />
                  ))}
                </NewsList>
              )}
            </NewsPreview>

            <Sidebar>
              <SidebarCard>
                <SectionHeading>Quick access</SectionHeading>
                <ButtonGroup style={{ flexDirection: 'column' }}>
                  <PrimaryButton to="/feed">Go to Feed</PrimaryButton>
                  <SecondaryButton to="/dashboard">Dashboard</SecondaryButton>
                </ButtonGroup>
                <SmallNote>Use your feed to follow topics, save stories, and see the news that matters most.</SmallNote>
              </SidebarCard>

              <SidebarCard>
                <SectionHeading>Trending Topics</SectionHeading>
                <TopicsList>
                  {topics.slice(0, 8).map((topic) => (
                    <TopicChip key={topic.id} to={`/feed?topic=${topic.id}`}>
                      {topic.name}
                    </TopicChip>
                  ))}
                </TopicsList>
                <SmallNote>Focus your homepage by picking a topic that interests you.</SmallNote>
              </SidebarCard>
            </Sidebar>
          </PreviewGrid>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Hero>
          <HeroCopy>
            <Logo>📰 NewsNepal</Logo>
            <Tagline>Nepal's Unfiltered News Hub</Tagline>
            <Description>
              See what's really happening in Nepal. Follow topics that matter,
              share news from every side, and decide for yourself.
            </Description>
            <ButtonGroup>
              <PrimaryButton to="/register">Create Account</PrimaryButton>
              <SecondaryButton to="/login">Sign In</SecondaryButton>
            </ButtonGroup>
          </HeroCopy>

          <HeroDetails>
            <DetailHeading>Stay informed, stay in control</DetailHeading>
            <DetailText>
              Browse trending news, explore local topics, and get a clearer view of each story with balanced coverage from across Nepal.
            </DetailText>
          </HeroDetails>
        </Hero>

        <PreviewGrid>
          <NewsPreview>
            <PreviewCard>
              <PreviewTitle>Top stories preview</PreviewTitle>
              <PreviewText>
                Discover the kind of news you’ll see after you sign in: local updates, topic highlights, and trending coverage from across Nepal.
              </PreviewText>
            </PreviewCard>
          </NewsPreview>

          <Sidebar>
            <SidebarCard>
              <PreviewTitle>Why join?</PreviewTitle>
              <PreviewText>
                Create your own posts, follow topics you care about, and personalize your feed so news stays relevant to you.
              </PreviewText>
            </SidebarCard>

            <SidebarCard>
              <PreviewTitle>Fast access</PreviewTitle>
              <PreviewText>
                Get straight to the feed, explore topic categories, and see the latest stories from sources you trust.
              </PreviewText>
            </SidebarCard>
          </Sidebar>
        </PreviewGrid>

        <Features>
          <Feature>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureText>Trending News</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>🏷️</FeatureIcon>
            <FeatureText>By Topic</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureText>Bias Check</FeatureText>
          </Feature>
        </Features>
      </Content>
    </Container>
  );
};

export default Landing;
