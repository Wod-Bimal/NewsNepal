import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiBookOpen, FiHeart, FiMessageSquare, FiPlusCircle, FiTrendingUp,
  FiUsers, FiUserPlus, FiBarChart2, FiChevronRight, FiArrowRight,
  FiAward, FiEye,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authService, newsService } from '../services/api.js';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #657786;
  margin-bottom: 12px;

  a { color: #1da1f2; text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
`;

const PageTitle = styled.h1`
  margin: 0 0 4px;
  font-size: 26px;
  color: #14171a;
`;

const PageSubtitle = styled.p`
  margin: 0 0 24px;
  font-size: 15px;
  color: #657786;
`;

const HeroCard = styled.div`
  background: linear-gradient(135deg, #1da1f2 0%, #0f69b4 100%);
  border-radius: 20px;
  padding: 24px 28px;
  color: white;
  box-shadow: 0 16px 40px rgba(29, 161, 242, 0.16);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const HeroLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 220px;
`;

const HeroAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 2px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  flex-shrink: 0;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const HeroAvatarFallback = styled.div`
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 800;
`;

const HeroTitle = styled.h1`
  margin: 0 0 4px;
  font-size: 22px;
`;

const HeroText = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  opacity: 0.92;
  line-height: 1.6;
`;

const HeroMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  opacity: 0.9;
  flex-wrap: wrap;
`;

const HeroMetaItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
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
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

  &:hover { transform: translateY(-1px); }
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
  transition: background 0.15s;

  &:hover { background: rgba(255, 255, 255, 0.24); }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 20px rgba(20, 23, 26, 0.04);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(20, 23, 26, 0.08);
  }
`;

const StatIcon = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: ${p => p.$bg || '#EBF5FF'};
  color: ${p => p.$color || '#1da1f2'};
`;

const StatBody = styled.div`
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #14171a;
  line-height: 1.1;
`;

const StatLabel = styled.div`
  color: #657786;
  font-size: 13px;
  margin-top: 2px;
`;

const StatMeta = styled.div`
  color: #9ca3af;
  font-size: 12px;
  margin-top: 2px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(20, 23, 26, 0.04);
`;

const GridCard = styled(Card)`
  &:nth-child(3) { grid-column: span 1; }
  @media (max-width: 900px) {
    &:nth-child(1) { grid-column: span 2; }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 17px;
  color: #14171a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewAll = styled(Link)`
  font-size: 13px;
  color: #1da1f2;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover { text-decoration: underline; }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  border: 1px solid #f0f2f5;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fcfdff;
  transition: border-color 0.15s;

  &:hover { border-color: #d7e7f7; }
`;

const ActivityTitle = styled.div`
  font-weight: 700;
  color: #14171a;
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActivityMeta = styled.div`
  font-size: 13px;
  color: #657786;
`;

const ActivityChips = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #657786;
  background: #f0f4f8;
  padding: 2px 8px;
  border-radius: 999px;
`;

const EmptyState = styled.div`
  padding: 18px 16px;
  border-radius: 12px;
  background: #f7f9fa;
  color: #657786;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
`;

const ChartCard = styled(Card)`
  margin-bottom: 20px;
`;

const ChartBars = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 16px;
  height: 160px;
  padding-top: 12px;
`;

const BarCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 130px;
`;

const BarValue = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #14171a;
`;

const BarTrack = styled.div`
  width: 46px;
  max-width: 100%;
  height: 100px;
  background: #eff3f6;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
`;

const BarFill = styled.div`
  width: 100%;
  height: ${p => p.$height || 0}%;
  background: linear-gradient(180deg, ${p => p.$color || '#1da1f2'} 0%, ${p => p.$colorDark || '#0f69b4'} 100%);
  border-radius: 8px 8px 0 0;
  transition: height 0.5s ease;
`;

const BarLabel = styled.div`
  font-size: 12px;
  color: #657786;
  font-weight: 600;
`;

const ProfileReach = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(20, 23, 26, 0.04);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const ReachText = styled.div``;

const ReachTitle = styled.div`
  font-weight: 800;
  color: #14171a;
  font-size: 15px;
  margin-bottom: 4px;
`;

const ReachMeta = styled.div`
  color: #657786;
  font-size: 13px;
`;

const ReachStat = styled.div`
  display: flex;
  gap: 24px;
`;

const ReachItem = styled.div`
  text-align: center;
`;

const ReachNum = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #14171a;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ReachLabel = styled.div`
  font-size: 12px;
  color: #657786;
`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, #eef1f4 25%, #f6f8fa 37%, #eef1f4 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 10px;
  height: ${p => p.$h || '16px'};
  width: ${p => p.$w || '100%'};
  margin-bottom: 10px;

  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await authService.getStats();
        setStats(statsRes.data);
      } catch {
        setStats({ news_count: 0, total_likes_received: 0, comments_made: 0, news_liked: 0, bias_votes: 0, followers_count: 0, following_count: 0 });
      }

      if (!user) {
        setLoading(false);
        return;
      }

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

      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const joinDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const s = stats || {};
  const engagement = [
    { label: 'Likes', value: s.total_likes_received ?? 0, color: '#e0245e', colorDark: '#b01e4b', icon: FiHeart },
    { label: 'Comments', value: s.comments_made ?? 0, color: '#1da1f2', colorDark: '#0f69b4', icon: FiMessageSquare },
    { label: 'Bias votes', value: s.bias_votes ?? 0, color: '#059669', colorDark: '#047857', icon: FiAward },
  ];
  const maxEngagement = Math.max(1, ...engagement.map(e => e.value));

  return (
    <Container>
      <Breadcrumb>
        <Link to="/">Home</Link>
        <FiChevronRight />
        <span>Dashboard</span>
      </Breadcrumb>
      <PageTitle>Dashboard</PageTitle>
      <PageSubtitle>Your publishing overview at a glance.</PageSubtitle>

      <HeroCard>
        <HeroLeft>
          <HeroAvatar>
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user?.username} />
            ) : (
              <HeroAvatarFallback>{(user?.username?.[0] || 'U').toUpperCase()}</HeroAvatarFallback>
            )}
          </HeroAvatar>
          <div>
            <HeroTitle>Welcome back, {user?.first_name || user?.username || 'there'}.</HeroTitle>
            <HeroText>
              Here's how your stories are performing across the community.
            </HeroText>
            <HeroMeta>
              {user?.username && <HeroMetaItem>{user.username}</HeroMetaItem>}
              {joinDate && <HeroMetaItem>Joined {joinDate}</HeroMetaItem>}
              <HeroMetaItem><FiEye /> {s.news_count ?? 0} posts</HeroMetaItem>
            </HeroMeta>
          </div>
        </HeroLeft>
        <ActionRow>
          <PrimaryAction to="/create">
            <FiPlusCircle /> Create new post
          </PrimaryAction>
          <SecondaryAction to="/feed">
            <FiTrendingUp /> Open feed
          </SecondaryAction>
        </ActionRow>
      </HeroCard>

      {loading ? (
        <>
          <StatsGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <Skeleton $h="48px" $w="48px" />
                <Skeleton $h="22px" $w="70%" />
                <Skeleton $h="12px" $w="50%" />
              </Card>
            ))}
          </StatsGrid>
        </>
      ) : (
        <StatsGrid>
          <StatCard>
            <StatIcon $bg="#EBF5FF" $color="#1da1f2"><FiBookOpen /></StatIcon>
            <StatBody>
              <StatValue>{s.news_count ?? 0}</StatValue>
              <StatLabel>Posts</StatLabel>
              <StatMeta>Published stories</StatMeta>
            </StatBody>
          </StatCard>
          <StatCard>
            <StatIcon $bg="#FDF0F4" $color="#e0245e"><FiHeart /></StatIcon>
            <StatBody>
              <StatValue>{s.total_likes_received ?? 0}</StatValue>
              <StatLabel>Likes received</StatLabel>
              <StatMeta>Community engagement</StatMeta>
            </StatBody>
          </StatCard>
          <StatCard>
            <StatIcon $bg="#EBF5FF" $color="#1da1f2"><FiMessageSquare /></StatIcon>
            <StatBody>
              <StatValue>{s.comments_made ?? 0}</StatValue>
              <StatLabel>Comments</StatLabel>
              <StatMeta>Replies you shared</StatMeta>
            </StatBody>
          </StatCard>
          <StatCard>
            <StatIcon $bg="#F0F6FF" $color="#2563eb"><FiTrendingUp /></StatIcon>
            <StatBody>
              <StatValue>{s.news_liked ?? 0}</StatValue>
              <StatLabel>Liked news</StatLabel>
              <StatMeta>Stories you saved</StatMeta>
            </StatBody>
          </StatCard>
          <StatCard>
            <StatIcon $bg="#EEF7F2" $color="#059669"><FiUsers /></StatIcon>
            <StatBody>
              <StatValue>{s.followers_count ?? 0}</StatValue>
              <StatLabel>Followers</StatLabel>
              <StatMeta>People following you</StatMeta>
            </StatBody>
          </StatCard>
          <StatCard>
            <StatIcon $bg="#F5F3FF" $color="#7c3aed"><FiUserPlus /></StatIcon>
            <StatBody>
              <StatValue>{s.following_count ?? 0}</StatValue>
              <StatLabel>Following</StatLabel>
              <StatMeta>People you follow</StatMeta>
            </StatBody>
          </StatCard>
        </StatsGrid>
      )}

      <ChartCard>
        <SectionHeader>
          <SectionTitle><FiBarChart2 /> Engagement overview</SectionTitle>
        </SectionHeader>
        <ChartBars>
          {engagement.map((e) => (
            <BarCol key={e.label}>
              <BarValue>{e.value}</BarValue>
              <BarTrack>
                <BarFill $height={Math.round((e.value / maxEngagement) * 100)} $color={e.color} $colorDark={e.colorDark} />
              </BarTrack>
              <BarLabel>{e.label}</BarLabel>
            </BarCol>
          ))}
        </ChartBars>
      </ChartCard>

      <Grid>
        <GridCard>
          <SectionHeader>
            <SectionTitle>Recent posts</SectionTitle>
            <ViewAll to="/profile">View all <FiArrowRight /></ViewAll>
          </SectionHeader>
          {recentPosts.length > 0 ? (
            <List>
              {recentPosts.map((post) => (
                <ActivityItem key={post.id}>
                  <ActivityTitle>{post.title}</ActivityTitle>
                  <ActivityMeta>{formatDate(post.created_at)}</ActivityMeta>
                  <ActivityChips>
                    <Chip><FiHeart /> {post.like_count ?? 0}</Chip>
                    <Chip><FiMessageSquare /> {post.comment_count ?? 0}</Chip>
                  </ActivityChips>
                </ActivityItem>
              ))}
            </List>
          ) : (
            <EmptyState>
              No recent posts yet. Start sharing news to populate this area.
            </EmptyState>
          )}
        </GridCard>

        <GridCard>
          <SectionHeader>
            <SectionTitle>Recent comments</SectionTitle>
          </SectionHeader>
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
        </GridCard>

        <GridCard>
          <SectionHeader>
            <SectionTitle>Your reach</SectionTitle>
          </SectionHeader>
          <ReachStat>
            <ReachItem>
              <ReachNum><FiUsers /> {s.followers_count ?? 0}</ReachNum>
              <ReachLabel>Followers</ReachLabel>
            </ReachItem>
            <ReachItem>
              <ReachNum><FiUserPlus /> {s.following_count ?? 0}</ReachNum>
              <ReachLabel>Following</ReachLabel>
            </ReachItem>
          </ReachStat>
          <ActivityMeta style={{ marginTop: 12 }}>Grow your audience by sharing quality news.</ActivityMeta>
        </GridCard>
      </Grid>
    </Container>
  );
};

export default Dashboard;
