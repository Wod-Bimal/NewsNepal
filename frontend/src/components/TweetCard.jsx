import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import axios from 'axios';
import styled from 'styled-components';
import { FaHeart, FaRetweet, FaComment, FaTrash } from 'react-icons/fa';

const TweetContainer = styled.div`
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TweetHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.span`
  font-weight: 600;
  color: #14171A;
  margin-right: 8px;
`;

const Topic = styled.span`
  background: ${props => props.color || '#1DA1F2'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const Timestamp = styled.span`
  color: #657786;
  font-size: 14px;
`;

const TweetContent = styled.div`
  margin-bottom: 16px;
  line-height: 1.5;
  color: #14171A;
`;

const TweetImage = styled.img`
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  margin-top: 12px;
`;

const TweetActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid #F7F9FA;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${props => props.active ? '#E0245E' : '#657786'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: ${props => props.active ? '#C71E5A' : '#1DA1F2'};
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #E0245E;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #FDF2F8;
  }
`;

const TweetCard = ({ tweet, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isRetweeting, setIsRetweeting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await axios.post(`/api/tweets/${tweet.id}/like/`);
      onUpdate();
    } catch (error) {
      console.error('Error liking tweet:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRetweet = async () => {
    if (!isAuthenticated || isRetweeting) return;
    
    setIsRetweeting(true);
    try {
      const response = await axios.post(`/api/tweets/${tweet.id}/retweet/`);
      onUpdate();
    } catch (error) {
      console.error('Error retweeting:', error);
    } finally {
      setIsRetweeting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || user?.id !== tweet.author.id) return;
    
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        await axios.delete(`/api/tweets/${tweet.id}/delete/`);
        onUpdate();
      } catch (error) {
        console.error('Error deleting tweet:', error);
      }
    }
  };

  return (
    <TweetContainer>
      <TweetHeader>
        <Avatar 
          src={tweet.author.profile_picture || '/default-avatar.png'} 
          alt={tweet.author.username}
        />
        <UserInfo>
          <Username>{tweet.author.username}</Username>
          {tweet.author.first_name && tweet.author.last_name && (
            <span style={{ color: '#657786', marginLeft: '8px' }}>
              {tweet.author.first_name} {tweet.author.last_name}
            </span>
          )}
          {tweet.topic && (
            <Topic color={tweet.topic.color}>
              {tweet.topic.name}
            </Topic>
          )}
        </UserInfo>
        <Timestamp>{formatDate(tweet.created_at)}</Timestamp>
        {isAuthenticated && user?.id === tweet.author.id && (
          <DeleteButton onClick={handleDelete} title="Delete tweet">
            <FaTrash size={14} />
          </DeleteButton>
        )}
      </TweetHeader>
      
      <TweetContent>
        {tweet.content}
      </TweetContent>
      
      {tweet.image && (
        <TweetImage src={tweet.image} alt="Tweet image" />
      )}
      
      <TweetActions>
        <ActionButton 
          active={tweet.is_liked}
          onClick={handleLike}
          disabled={isLiking}
        >
          <FaHeart />
          {tweet.like_count}
        </ActionButton>
        
        <ActionButton 
          active={tweet.is_retweeted}
          onClick={handleRetweet}
          disabled={isRetweeting}
        >
          <FaRetweet />
          {tweet.retweet_count}
        </ActionButton>
        
        <ActionButton>
          <FaComment />
          {tweet.comment_count}
        </ActionButton>
      </TweetActions>
    </TweetContainer>
  );
};

export default TweetCard;