import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import styled from 'styled-components';
import NewsCard from '../components/NewsCard.jsx';
import FollowListModal from '../components/FollowListModal.jsx';
import { userService } from '../services/api.js';
import { FaArrowLeft, FaEnvelope, FaUserPlus, FaUserCheck, FaUserMinus } from 'react-icons/fa';

const Container = styled.div`max-width: 900px; margin: 0 auto; padding: 20px;`;

const BackLink = styled.button`
  background: none; border: none; color: #1DA1F2; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 16px;
  padding: 0; &:hover { text-decoration: underline; }
`;

const Card = styled.div`
  background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px;
  border: 1px solid #E1E8ED;
`;

const ProfileTop = styled.div`
  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
`;

const Avatar = styled.img`
  width: 120px; height: 120px; border-radius: 50%; object-fit: cover;
  border: 4px solid #1DA1F2;
`;

const AvatarPlaceholder = styled.div`
  width: 120px; height: 120px; border-radius: 50%; border: 4px solid #1DA1F2;
  background: #E1E8ED; display: flex; align-items: center; justify-content: center;
  font-size: 48px; color: #657786; font-weight: 700;
`;

const Info = styled.div`flex: 1; min-width: 200px;`;
const Username = styled.h1`color: #14171A; margin: 0 0 4px 0; font-size: 26px;`;
const FullName = styled.h2`color: #657786; margin: 0 0 8px 0; font-size: 16px; font-weight: normal;`;
const Bio = styled.p`color: #14171A; margin: 0 0 8px 0; line-height: 1.5; font-size: 14px;`;
const LocationText = styled.div`color: #657786; font-size: 14px; margin-bottom: 4px;`;
const JoinDate = styled.div`color: #9CA3AF; font-size: 13px;`;

const StatsRow = styled.div`display: flex; gap: 32px; margin-top: 12px; flex-wrap: wrap;`;
const StatItem = styled.div`text-align: center;`;
const StatNum = styled.span`font-weight: 700; font-size: 18px; color: #14171A; display: block;`;
const StatLabel = styled.span`color: #657786; font-size: 13px;`;
const StatLink = styled.button`
  background: none; border: none; cursor: pointer; padding: 0; text-align: center;
  &:hover span:first-child { color: #1DA1F2; }
`;

const BtnRow = styled.div`display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;`;

const Btn = styled.button`
  padding: 8px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 14px;
  border: 1px solid ${p => p.$primary ? '#1DA1F2' : p.$danger ? '#E0245E' : '#E1E8ED'};
  background: ${p => p.$primary ? '#1DA1F2' : p.$danger ? '#E0245E' : 'transparent'};
  color: ${p => (p.$primary || p.$danger) ? 'white' : '#1DA1F2'};
  display: flex; align-items: center; gap: 6px;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Tabs = styled.div`display: flex; border-bottom: 1px solid #E1E8ED; margin-bottom: 16px; gap: 0;`;
const Tab = styled.button`
  flex: 1; padding: 12px; background: none; border: none; border-bottom: 3px solid
  ${p => p.$active ? '#1DA1F2' : 'transparent'};
  color: ${p => p.$active ? '#1DA1F2' : '#657786'};
  font-weight: ${p => p.$active ? '700' : '500'}; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
  &:hover { color: #1DA1F2; background: #F7F9FA; }
`;

const Empty = styled.div`text-align: center; padding: 40px; color: #657786;`;
const Loading = styled.div`text-align: center; padding: 60px; color: #657786; font-size: 16px;`;

const MutualBadge = styled.span`
  background: #059669; color: white; font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 10px; margin-left: 8px;
`;

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [tab, setTab] = useState('posts');
  const [showFollowModal, setShowFollowModal] = useState(null);

  const isOwnProfile = currentUser?.id === parseInt(id);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getPublicProfile(id);
      setProfile(res.data);
    } catch {
      showError('User not found');
      navigate('/feed');
    }
    setLoading(false);
  }, [id, showError, navigate]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await userService.getUserNews(id);
      setPosts(res.data);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        const res = await userService.unfollow(id);
        setProfile(prev => ({
          ...prev,
          is_following: false,
          followers_count: res.data.followers_count,
        }));
        showSuccess('Unfollowed');
      } else {
        const res = await userService.follow(id);
        setProfile(prev => ({
          ...prev,
          is_following: true,
          followers_count: res.data.followers_count,
        }));
        showSuccess('Following!');
      }
    } catch {
      showError('Action failed');
    }
    setFollowLoading(false);
  };

  const handleMessage = () => {
    navigate('/messages');
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return <Loading>Loading profile...</Loading>;
  if (!profile) return null;

  return (
    <Container>
      <BackLink onClick={() => navigate(-1)}><FaArrowLeft /> Back</BackLink>

      <Card>
        <ProfileTop>
          {profile.profile_picture ? (
            <Avatar src={profile.profile_picture} alt={profile.username} />
          ) : (
            <AvatarPlaceholder>{profile.username[0].toUpperCase()}</AvatarPlaceholder>
          )}

          <Info>
            <Username>
              @{profile.username}
              {profile.is_following && profile.is_followed_by && (
                <MutualBadge>Mutual</MutualBadge>
              )}
            </Username>
            {(profile.first_name || profile.last_name) && (
              <FullName>{profile.first_name} {profile.last_name}</FullName>
            )}
            {profile.bio && <Bio>{profile.bio}</Bio>}
            {profile.location && <LocationText>{profile.location}</LocationText>}
            <JoinDate>Joined {formatDate(profile.created_at)}</JoinDate>

            <StatsRow>
              <StatItem>
                <StatNum>{profile.posts_count}</StatNum>
                <StatLabel>posts</StatLabel>
              </StatItem>
              <StatLink onClick={() => setShowFollowModal('followers')}>
                <StatNum>{profile.followers_count}</StatNum>
                <StatLabel>followers</StatLabel>
              </StatLink>
              <StatLink onClick={() => setShowFollowModal('following')}>
                <StatNum>{profile.following_count}</StatNum>
                <StatLabel>following</StatLabel>
              </StatLink>
            </StatsRow>

            {!isOwnProfile && (
              <BtnRow>
                <Btn $primary onClick={handleFollow} disabled={followLoading}>
                  {profile.is_following ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>}
                </Btn>
                {(profile.is_following || profile.is_followed_by) && (
                  <Btn onClick={handleMessage}>
                    <FaEnvelope /> Message
                  </Btn>
                )}
              </BtnRow>
            )}
          </Info>
        </ProfileTop>
      </Card>

      {showFollowModal && (
        <FollowListModal
          userId={id}
          initialTab={showFollowModal}
          onClose={() => setShowFollowModal(null)}
          onUpdate={fetchProfile}
        />
      )}

      <Card>
        <Tabs>
          <Tab $active={tab === 'posts'} onClick={() => setTab('posts')}>Posts</Tab>
        </Tabs>

        {tab === 'posts' && (
          posts.length === 0 ? <Empty>No posts yet.</Empty> :
          posts.map(n => <NewsCard key={n.id} newsItem={n} onUpdate={fetchPosts} />)
        )}
      </Card>
    </Container>
  );
};

export default PublicProfile;
