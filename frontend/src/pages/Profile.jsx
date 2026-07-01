import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import styled from 'styled-components';
import TweetCard from '../components/TweetCard.jsx';
import { newsService } from '../services/api.js';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  border: 1px solid #E1E8ED;
  text-align: center;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  border: 4px solid #1DA1F2;
`;

const Username = styled.h1`
  color: #14171A;
  margin-bottom: 8px;
  font-size: 28px;
`;

const FullName = styled.h2`
  color: #657786;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: normal;
`;

const Bio = styled.p`
  color: #14171A;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const Location = styled.div`
  color: #657786;
  margin-bottom: 20px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #14171A;
`;

const StatLabel = styled.div`
  color: #657786;
  font-size: 14px;
`;

const TweetsContainer = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h3`
  color: #14171A;
  margin-bottom: 20px;
  font-size: 20px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
  color: #657786;
`;

const ErrorContainer = styled.div`
  background: #FDF2F8;
  color: #E0245E;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #FCE7F3;
`;

const Profile = () => {
  const { user } = useAuth();
  const [userNews, setUserNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserNews = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await newsService.getNews();
      const filtered = response.data.filter((item) => item.author.id === user.id);
      setUserNews(filtered);
      setError(null);
    } catch {
      setError('Failed to load your news posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserNews();
  }, [fetchUserNews]);

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingContainer>
          <p>Loading profile...</p>
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar 
          src={user?.profile_picture || '/default-avatar.png'} 
          alt={user?.username}
        />
        <Username>@{user?.username}</Username>
        {(user?.first_name || user?.last_name) && (
          <FullName>
            {user?.first_name} {user?.last_name}
          </FullName>
        )}
        {user?.bio && <Bio>{user.bio}</Bio>}
        {user?.location && <Location>📍 {user.location}</Location>}
        
        <StatsContainer>
          <Stat>
            <StatNumber>{userNews.length}</StatNumber>
            <StatLabel>News Posts</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>
              {userNews.reduce((sum, newsItem) => sum + newsItem.like_count, 0)}
            </StatNumber>
            <StatLabel>Likes Received</StatLabel>
          </Stat>
          <Stat>
            <StatNumber>
              {userNews.reduce((sum, newsItem) => sum + newsItem.share_count, 0)}
            </StatNumber>
            <StatLabel>Shares</StatLabel>
          </Stat>
        </StatsContainer>
      </ProfileHeader>

      <TweetsContainer>
        <SectionTitle>Your Tweets</SectionTitle>
        
        {error && (
          <ErrorContainer>
            {error}
          </ErrorContainer>
        )}

        {userNews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#657786' }}>
            <p>You haven't posted any news yet. Share your thoughts about politics in Nepal!</p>
          </div>
        ) : (
          userNews.map((newsItem) => (
            <TweetCard 
              key={newsItem.id} 
              tweet={newsItem} 
              onUpdate={fetchUserNews}
            />
          ))
        )}
      </TweetsContainer>
    </ProfileContainer>
  );
};

export default Profile;