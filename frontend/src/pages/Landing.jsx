import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import styled from 'styled-components';
import NewsCard from '../components/NewsCard.jsx';
import { newsService, topicService } from '../services/api.js';

const Container = styled.div`
  min-height: calc(100vh - 68px);
  background:
    radial-gradient(ellipse at 85% 2%, rgba(216, 233, 220, 0.62), transparent 34rem),
    #f7f8f5;
  padding: 52px 24px 72px;

  @media (max-width: 600px) {
    padding: 28px 16px 48px;
  }
`;

const Content = styled.div`
  max-width: 1160px;
  margin: 0 auto;
`;

const Hero = styled.div`
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e9e4;
  border-radius: 28px;
  padding: 56px;
  box-shadow: 0 22px 60px rgba(27, 47, 37, 0.08);
  display: grid;
  grid-template-columns: 1fr;
  gap: 44px;
  margin-bottom: 36px;

  @media (min-width: 860px) {
    grid-template-columns: 1.2fr 0.8fr;
  }

  @media (max-width: 600px) {
    border-radius: 22px;
    padding: 30px 24px;
    gap: 28px;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Logo = styled.h1`
  font-size: 37px;
  letter-spacing: -1.6px;
  line-height: 1.15;
  color: #17241f;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    font-size: 30px;
  }
`;

const Tagline = styled.h2`
  max-width: 600px;
  font-size: clamp(36px, 5vw, 58px);
  letter-spacing: -2.7px;
  color: #17241f;
  line-height: 1.04;
  margin-bottom: 22px;

  @media (max-width: 480px) {
    letter-spacing: -1.5px;
  }
`;

const Description = styled.p`
  max-width: 570px;
  color: #68766f;
  font-size: 17px;
  line-height: 1.75;
  margin-bottom: 30px;
`;

const Eyebrow = styled.p`
  color: #16704f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.6px;
  line-height: 1.4;
  margin-bottom: 14px;
  text-transform: uppercase;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 480px) {
    > a {
      width: 100%;
    }
  }
`;

const PrimaryButton = styled(Link)`
  background: #16704f;
  color: white;
  padding: 14px 24px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: #10583e;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(22, 112, 79, 0.2);
  }
`;

const SecondaryButton = styled(Link)`
  background: white;
  color: #16704f;
  padding: 13px 24px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  border: 1px solid #c8dacf;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #f0f5f1;
    border-color: #9ebdaa;
    transform: translateY(-2px);
  }
`;

const HeroDetails = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #edf5ef, #e4efe7);
  border: 1px solid #dce9df;
  border-radius: 22px;
  padding: 34px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &::after {
    content: '';
    position: absolute;
    width: 190px;
    height: 190px;
    right: -78px;
    bottom: -96px;
    border: 1px solid rgba(22, 112, 79, 0.14);
    border-radius: 50%;
    box-shadow: 0 0 0 22px rgba(22, 112, 79, 0.035), 0 0 0 46px rgba(22, 112, 79, 0.025);
    pointer-events: none;
  }

  @media (max-width: 600px) {
    padding: 26px;
  }
`;

const DetailHeading = styled.h3`
  font-size: 21px;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
  color: #17241f;
`;

const DetailText = styled.p`
  color: #53665b;
  font-size: 15px;
  line-height: 1.8;
`;

const PreviewGrid = styled.div`
  display: grid;
  gap: 24px;
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
  font-size: 21px;
  letter-spacing: -0.5px;
  color: #17241f;
  margin-bottom: 16px;
`;

const NewsList = styled.div`
  display: grid;
  gap: 16px;
`;

const Sidebar = styled.div`
  display: grid;
  gap: 20px;
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e5e9e4;
  box-shadow: 0 8px 24px rgba(27, 47, 37, 0.04);

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const TopicsList = styled.div`
  display: grid;
  gap: 8px;
`;

const TopicChip = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: #f3f6f2;
  color: #405248;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #e8f2ec;
    color: #16704f;
    transform: translateX(2px);
  }
`;

const PreviewCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e5e9e4;
  box-shadow: 0 8px 24px rgba(27, 47, 37, 0.04);
`;

const PreviewTitle = styled.h4`
  font-size: 18px;
  margin-bottom: 12px;
  color: #17241f;
`;

const PreviewText = styled.p`
  color: #68766f;
  line-height: 1.7;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e9e4;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Feature = styled.div`
  background: white;
  border: 1px solid #e5e9e4;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(27, 47, 37, 0.04);
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(27, 47, 37, 0.08);
  }
`;

const FeatureIcon = styled.div`
  font-size: 28px;
  margin-bottom: 12px;
`;

const FeatureText = styled.div`
  font-size: 14px;
  color: #68766f;
  font-weight: 600;
`;

const SmallNote = styled.p`
  color: #68766f;
  font-size: 14px;
  line-height: 1.7;
  margin-top: 12px;
`;

const EmptyState = styled.div`
  background: #FFFFFF;
  border: 1px solid #e5e9e4;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  color: #68766f;
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
              <Eyebrow>Your daily briefing</Eyebrow>
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
            <Eyebrow>Independent voices. A clearer picture.</Eyebrow>
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
