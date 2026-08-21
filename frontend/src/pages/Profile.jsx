import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import styled from 'styled-components';
import NewsCard from '../components/NewsCard.jsx';
import FollowListModal from '../components/FollowListModal.jsx';
import { newsService, authService } from '../services/api.js';

const Container = styled.div`max-width: 900px; margin: 0 auto; padding: 20px;`;

const Card = styled.div`
  background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px;
  border: 1px solid #E1E8ED;
`;

const ProfileTop = styled.div`
  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
`;

const AvatarWrap = styled.div`position: relative; flex-shrink: 0;`;

const Avatar = styled.img`
  width: 120px; height: 120px; border-radius: 50%; object-fit: cover;
  border: 4px solid #1DA1F2; cursor: pointer;
`;

const AvatarOverlay = styled.div`
  position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: ${p => p.$hover ? 1 : 0}; transition: opacity 0.2s; color: white; font-size: 13px;
  cursor: pointer;
`;

const HiddenInput = styled.input`display: none;`;

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
  border: 1px solid ${p => p.$primary ? '#1DA1F2' : '#E1E8ED'};
  background: ${p => p.$primary ? '#1DA1F2' : 'transparent'};
  color: ${p => p.$primary ? 'white' : p.$danger ? '#E0245E' : '#1DA1F2'};
  &:hover { opacity: 0.85; }
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

const EditForm = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const FormRow = styled.div`display: flex; gap: 12px; flex-wrap: wrap;`;

const Input = styled.input`
  flex: 1; min-width: 150px; padding: 10px; border: 1px solid #E1E8ED; border-radius: 8px;
  font-size: 14px;
  &:focus { outline: none; border-color: #1DA1F2; }
`;

const TextArea = styled.textarea`
  width: 100%; padding: 10px; border: 1px solid #E1E8ED; border-radius: 8px;
  font-size: 14px; resize: vertical; font-family: inherit; min-height: 60px;
  &:focus { outline: none; border-color: #1DA1F2; }
`;

const Empty = styled.div`text-align: center; padding: 40px; color: #657786;`;

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [hoverAvatar, setHoverAvatar] = useState(false);

  const [tab, setTab] = useState('posts');
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedNews, setLikedNews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await authService.getStats();
      setStats(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoadingTab(true);
    try {
      const res = await newsService.getNews();
      const items = res.data.results || res.data;
      setPosts(items.filter(n => n.author?.id === user.id));
    } catch { /* ignore */ }
    setLoadingTab(false);
  }, [user]);

  const fetchLiked = useCallback(async () => {
    setLoadingTab(true);
    try {
      const res = await authService.getLikedNews();
      setLikedNews(res.data);
    } catch { /* ignore */ }
    setLoadingTab(false);
  }, []);

  const fetchComments = useCallback(async () => {
    setLoadingTab(true);
    try {
      const res = await authService.getMyComments();
      setComments(res.data);
    } catch { /* ignore */ }
    setLoadingTab(false);
  }, []);

  useEffect(() => { fetchStats(); fetchPosts(); }, [fetchStats, fetchPosts]);
  useEffect(() => {
    if (tab === 'liked') fetchLiked();
    else if (tab === 'comments') fetchComments();
  }, [tab, fetchLiked, fetchComments]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await authService.uploadPicture(file);
      await refreshUser();
      showSuccess('Profile picture updated');
    } catch {
      showError('Failed to upload picture');
    }
  };

  const handleRemovePicture = async () => {
    if (!user?.profile_picture) {
      showError('No profile picture to remove');
      return;
    }

    try {
      await authService.removePicture();
      await refreshUser();
      showSuccess('Profile picture removed');
    } catch {
      showError('Failed to remove picture');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await updateProfile(form);
    if (res.success) { showSuccess('Profile updated'); setEditing(false); fetchStats(); }
    else { showError('Failed to update profile'); }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Container>
      <Card>
        <ProfileTop>
          <AvatarWrap
            onMouseEnter={() => setHoverAvatar(true)}
            onMouseLeave={() => setHoverAvatar(false)}
            onClick={handleAvatarClick}
          >
            <Avatar src={user?.profile_picture || '/default-avatar.svg'} alt={user?.username} />
            <AvatarOverlay $hover={hoverAvatar}>Add / Change Photo</AvatarOverlay>
            <HiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} />
          </AvatarWrap>

          <Info>
            <Username>@{user?.username}</Username>
            {(user?.first_name || user?.last_name) && <FullName>{user?.first_name} {user?.last_name}</FullName>}
            {user?.bio && <Bio>{user.bio}</Bio>}
            {user?.location && <LocationText>{user.location}</LocationText>}
            <JoinDate>Joined {formatDate(user?.date_joined)}</JoinDate>

            <StatsRow>
              <StatItem><StatNum>{stats?.news_count ?? '—'}</StatNum><StatLabel>posts</StatLabel></StatItem>
              <StatLink onClick={() => setShowFollowModal('followers')}>
                <StatNum>{stats?.followers_count ?? 0}</StatNum>
                <StatLabel>followers</StatLabel>
              </StatLink>
              <StatLink onClick={() => setShowFollowModal('following')}>
                <StatNum>{stats?.following_count ?? 0}</StatNum>
                <StatLabel>following</StatLabel>
              </StatLink>
            </StatsRow>

            <BtnRow>
              <Btn $primary onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit Profile'}</Btn>
              {user?.profile_picture && (
                <Btn type="button" $danger onClick={handleRemovePicture}>Remove Photo</Btn>
              )}
            </BtnRow>
          </Info>
        </ProfileTop>

        {editing && (
          <EditForm as="form" onSubmit={handleSave} style={{ marginTop: 20 }}>
            <FormRow>
              <Input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" />
              <Input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" />
            </FormRow>
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
            <TextArea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" maxLength={500} />
            <FormRow>
              <Btn $primary type="submit">Save</Btn>
              <Btn type="button" onClick={() => setEditing(false)}>Cancel</Btn>
            </FormRow>
          </EditForm>
        )}
      </Card>

      {showFollowModal && (
        <FollowListModal
          userId={user.id}
          initialTab={showFollowModal}
          onClose={() => setShowFollowModal(null)}
          onUpdate={fetchStats}
        />
      )}

      <Card>
        <Tabs>
          <Tab $active={tab === 'posts'} onClick={() => setTab('posts')}>My Posts</Tab>
          <Tab $active={tab === 'liked'} onClick={() => setTab('liked')}>Liked</Tab>
          <Tab $active={tab === 'comments'} onClick={() => setTab('comments')}>Comments</Tab>
        </Tabs>

        {loadingTab && <Empty>Loading...</Empty>}

        {!loadingTab && tab === 'posts' && (
          posts.length === 0 ? <Empty>No posts yet.</Empty> :
          posts.map(n => <NewsCard key={n.id} newsItem={n} onUpdate={fetchPosts} />)
        )}

        {!loadingTab && tab === 'liked' && (
          likedNews.length === 0 ? <Empty>No liked news yet.</Empty> :
          likedNews.map(n => <NewsCard key={n.id} newsItem={n} />)
        )}

        {!loadingTab && tab === 'comments' && (
          comments.length === 0 ? <Empty>No comments yet.</Empty> :
          comments.map(c => (
            <Card key={c.id} style={{ marginBottom: 12, padding: 16 }}>
              <div style={{ fontSize: 13, color: '#657786', marginBottom: 6 }}>
                Comment on <strong>{c.news?.title || 'news'}</strong> · {formatDate(c.created_at)}
              </div>
              <div style={{ fontSize: 14, color: '#14171A' }}>{c.content}</div>
            </Card>
          ))
        )}
      </Card>
    </Container>
  );
};

export default Profile;
