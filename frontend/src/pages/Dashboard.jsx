import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiBookOpen, FiHeart, FiMessageSquare, FiPlusCircle, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authService, newsService } from '../services/api.js';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
`;

const HeroCard = styled.div`
  background: linear-gradient(135deg, #1da1f2 0%, #0f69b4 100%);
  border-radius: 20px;
  padding: 28px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  box-shadow: 0 16px 40px rgba(29, 161, 242, 0.16);
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeroTitle = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
`;

const HeroText = styled.p`
  margin: 0;
  font-size: 15px;
  opacity: 0.92;
  line-height: 1.6;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const PrimaryAction = styled(Link)`
  background: white;
  color: #1da1f2;
  padding: 10px 16px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const SecondaryAction = styled(Link)`
  background: rgba(255, 255, 255, 0.14);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.24);
  padding: 10px 16px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 20px rgba(20, 23, 26, 0.04);
`;

const StatTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #657786;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #14171a;
`;

const StatLabel = styled.div`
  color: #657786;
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(20, 23, 26, 0.04);
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 18px;
  color: #14171a;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: #f7f9fa;
  color: #657786;
  text-align: center;
`;

const ActivityItem = styled.div`
  border: 1px solid #f0f2f5;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fcfdff;
`;

const ActivityTitle = styled.div`
  font-weight: 700;
  color: #14171a;
  margin-bottom: 4px;
`;

const ActivityMeta = styled.div`
  font-size: 13px;
  color: #657786;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await authService.getStats();
        setStats(statsRes.data);
      } catch {
        setStats({ news_count: 0, total_likes_received: 0, comments_made: 0, news_liked: 0, bias_votes: 0 });
      }

      if (!user) return;

      try {
        const postsRes = await newsService.getNews();
        const items = postsRes.data.results || postsRes.data || [];
        setRecentPosts(items.filter((item) => item.author?.id === user.id).slice(0, 3));
      } catch {
        setRecentPosts([]);
      }

      try {
        const commentsRes = await authService.getMyComments();
        setRecentComments((commentsRes.data || []).slice(0, 3));
      } catch {
        setRecentComments([]);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Container>
      <HeroCard>
        <div>
          <HeroTitle>Welcome back, {user?.username || 'there'}.</HeroTitle>
          <HeroText>
            Your dashboard keeps your activity, engagement, and latest posts in one place.
          </HeroText>
        </div>
        <ActionRow>
          <PrimaryAction to="/create">
            <FiPlusCircle /> Create new post
          </PrimaryAction>
          <SecondaryAction to="/feed">
            <FiTrendingUp /> Open feed
          </SecondaryAction>
        </ActionRow>
      </HeroCard>

      <StatsGrid>
        <StatCard>
          <StatTop><FiBookOpen /> <span>Posts</span></StatTop>
          <StatValue>{stats?.news_count ?? 0}</StatValue>
          <StatLabel>Your published stories</StatLabel>
        </StatCard>
        <StatCard>
          <StatTop><FiHeart /> <span>Likes received</span></StatTop>
          <StatValue>{stats?.total_likes_received ?? 0}</StatValue>
          <StatLabel>Community engagement</StatLabel>
        </StatCard>
        <StatCard>
          <StatTop><FiMessageSquare /> <span>Comments</span></StatTop>
          <StatValue>{stats?.comments_made ?? 0}</StatValue>
          <StatLabel>Replies you shared</StatLabel>
        </StatCard>
        <StatCard>
          <StatTop><FiTrendingUp /> <span>Liked news</span></StatTop>
          <StatValue>{stats?.news_liked ?? 0}</StatValue>
          <StatLabel>Stories you saved</StatLabel>
        </StatCard>
      </StatsGrid>

      <Grid>
        <Card>
          <SectionTitle>Recent posts</SectionTitle>
          {recentPosts.length > 0 ? (
            <List>
              {recentPosts.map((post) => (
                <ActivityItem key={post.id}>
                  <ActivityTitle>{post.title}</ActivityTitle>
                  <ActivityMeta>{post.summary || 'No summary available'} · {formatDate(post.created_at)}</ActivityMeta>
                </ActivityItem>
              ))}
            </List>
          ) : (
            <EmptyState>No recent posts yet. Start sharing news to populate this area.</EmptyState>
          )}
        </Card>

        <Card>
          <SectionTitle>Recent comments</SectionTitle>
          {recentComments.length > 0 ? (
            <List>
              {recentComments.map((comment) => (
                <ActivityItem key={comment.id}>
                  <ActivityTitle>{comment.content}</ActivityTitle>
                  <ActivityMeta>{comment.news?.title || 'News discussion'} · {formatDate(comment.created_at)}</ActivityMeta>
                </ActivityItem>
              ))}
            </List>
          ) : (
            <EmptyState>Your latest comments will appear here once you engage with posts.</EmptyState>
          )}
        </Card>
      </Grid>
    </Container>
  );
};

export default Dashboard;
