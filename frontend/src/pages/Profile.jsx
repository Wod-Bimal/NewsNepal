import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import styled from 'styled-components';
import NewsCard from '../components/NewsCard.jsx';
import { newsService } from '../services/api.js';

const ProfileContainer = styled.div`max-width: 800px; margin: 0 auto; padding: 20px;`;

const ProfileHeader = styled.div`
  background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px;
  border: 1px solid #E1E8ED; text-align: center;
`;

const Avatar = styled.img`
  width: 120px; height: 120px; border-radius: 50%; object-fit: cover;
  margin-bottom: 20px; border: 4px solid #1DA1F2;
`;

const Username = styled.h1`color: #14171A; margin-bottom: 8px; font-size: 28px;`;
const FullName = styled.h2`color: #657786; margin-bottom: 16px; font-size: 18px; font-weight: normal;`;
const Bio = styled.p`color: #14171A; margin-bottom: 16px; line-height: 1.5;`;
const Location = styled.div`color: #657786; margin-bottom: 20px;`;

const StatsContainer = styled.div`display: flex; justify-content: center; gap: 40px;`;
const Stat = styled.div`text-align: center;`;
const StatNumber = styled.div`font-size: 24px; font-weight: bold; color: #14171A;`;
const StatLabel = styled.div`color: #657786; font-size: 14px;`;

const NewsContainer = styled.div`margin-top: 20px;`;
const SectionTitle = styled.h3`color: #14171A; margin-bottom: 20px; font-size: 20px;`;

const LoadingContainer = styled.div`text-align: center; padding: 40px; color: #657786;`;
const ErrorContainer = styled.div`
  background: #FDF2F8; color: #E0245E; padding: 16px; border-radius: 8px;
  margin-bottom: 20px; border: 1px solid #FCE7F3;
`;

const EditBtn = styled.button`
  background: transparent; color: #1DA1F2; border: 1px solid #1DA1F2; padding: 8px 20px;
  border-radius: 20px; font-weight: 600; cursor: pointer; margin-bottom: 16px;
  &:hover { background: #F7F9FA; }
`;

const EditForm = styled.form`display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;`;

const Input = styled.input`
  width: 100%; padding: 10px; border: 1px solid #E1E8ED; border-radius: 8px; font-size: 14px;
  &:focus { outline: none; border-color: #1DA1F2; }
`;

const TextArea = styled.textarea`
  width: 100%; padding: 10px; border: 1px solid #E1E8ED; border-radius: 8px; font-size: 14px;
  resize: vertical; font-family: inherit; min-height: 60px;
  &:focus { outline: none; border-color: #1DA1F2; }
`;

const SaveBtn = styled.button`
  background: #1DA1F2; color: white; border: none; padding: 10px; border-radius: 8px;
  font-weight: 600; cursor: pointer; &:hover { background: #1991DB; }
`;

const CancelBtn = styled.button`
  background: transparent; color: #657786; border: 1px solid #E1E8ED; padding: 10px; border-radius: 8px;
  font-weight: 600; cursor: pointer; &:hover { background: #F7F9FA; }
`;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [userNews, setUserNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (user) {
      setForm({ first_name: user.first_name || '', last_name: user.last_name || '', bio: user.bio || '', location: user.location || '' });
    }
  }, [user]);

  const fetchUserNews = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await newsService.getNews();
      const filtered = response.data.results ? response.data.results.filter((item) => item.author.id === user.id) : response.data.filter((item) => item.author.id === user.id);
      setUserNews(filtered);
      setError(null);
    } catch { setError('Failed to load your news posts. Please try again.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchUserNews(); }, [fetchUserNews]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await updateProfile(form);
    if (res.success) { showSuccess('Profile updated'); setEditing(false); }
    else { showError('Failed to update profile'); }
  };

  if (loading) return <ProfileContainer><LoadingContainer><p>Loading profile...</p></LoadingContainer></ProfileContainer>;

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar src={user?.profile_picture || '/default-avatar.svg'} alt={user?.username} />
        <Username>@{user?.username}</Username>
        {(user?.first_name || user?.last_name) && <FullName>{user?.first_name} {user?.last_name}</FullName>}
        {user?.bio && <Bio>{user.bio}</Bio>}
        {user?.location && <Location>{user.location}</Location>}
        <EditBtn onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit Profile'}</EditBtn>
        {editing && (
          <EditForm onSubmit={handleSave}>
            <Input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" />
            <Input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" />
            <TextArea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" maxLength={500} />
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
            <div style={{ display: 'flex', gap: 12 }}>
              <SaveBtn type="submit">Save</SaveBtn>
              <CancelBtn type="button" onClick={() => setEditing(false)}>Cancel</CancelBtn>
            </div>
          </EditForm>
        )}
        <StatsContainer>
          <Stat><StatNumber>{userNews.length}</StatNumber><StatLabel>News Posts</StatLabel></Stat>
          <Stat><StatNumber>{userNews.reduce((sum, n) => sum + n.like_count, 0)}</StatNumber><StatLabel>Likes</StatLabel></Stat>
          <Stat><StatNumber>{userNews.reduce((sum, n) => sum + n.share_count, 0)}</StatNumber><StatLabel>Shares</StatLabel></Stat>
        </StatsContainer>
      </ProfileHeader>
      <NewsContainer>
        <SectionTitle>Your News Posts</SectionTitle>
        {error && <ErrorContainer>{error}</ErrorContainer>}
        {userNews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#657786' }}><p>You haven't posted any news yet.</p></div>
        ) : userNews.map((newsItem) => (
          <NewsCard key={newsItem.id} newsItem={newsItem} onUpdate={fetchUserNews} />
        ))}
      </NewsContainer>
    </ProfileContainer>
  );
};

export default Profile;
