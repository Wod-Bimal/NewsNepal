import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import styled from 'styled-components';
import TweetForm from '../components/TweetForm.jsx';
import TweetCard from '../components/TweetCard.jsx';
import { tweetService, topicService } from '../services/api.js';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 10px;
  }
`;

const MainContent = styled.div`
  min-width: 0;
`;

const Sidebar = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #E1E8ED;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E1E8ED;
  border-radius: 25px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #1DA1F2;
  }
`;

const TopicsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E1E8ED;
`;

const TopicsTitle = styled.h3`
  color: #14171A;
  margin-bottom: 16px;
  font-size: 18px;
`;

const TopicItem = styled.button`
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.active ? '#1DA1F2' : '#F7F9FA'};
  color: ${props => props.active ? 'white' : '#14171A'};
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#1991DB' : '#E1E8ED'};
  }
`;

const TopicName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const TopicCount = styled.div`
  font-size: 14px;
  opacity: 0.7;
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

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const fetchTweets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedTopic) params.topic = selectedTopic;
      if (searchQuery) params.search = searchQuery;

      const response = await tweetService.getTweets(params);
      setTweets(response.data);
      setError(null);
    } catch {
      setError('Failed to load tweets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedTopic, searchQuery]);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await topicService.getTopics();
      setTopics(response.data);
    } catch {
      // Topics sidebar is non-critical; fail silently
    }
  }, []);

  useEffect(() => {
    fetchTweets();
    fetchTopics();
  }, [fetchTweets, fetchTopics]);

  const handleTweetCreated = () => {
    fetchTweets();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTopicFilter = (topicId) => {
    setSelectedTopic(topicId === selectedTopic ? '' : topicId);
  };

  if (loading && tweets.length === 0) {
    return (
      <HomeContainer>
        <MainContent>
          <LoadingContainer>
            <p>Loading tweets...</p>
          </LoadingContainer>
        </MainContent>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <MainContent>
        {isAuthenticated && <TweetForm onTweetCreated={handleTweetCreated} />}

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search tweets..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        {error && (
          <ErrorContainer>
            {error}
          </ErrorContainer>
        )}

        {tweets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#657786' }}>
            <p>No tweets found. Be the first to share your thoughts!</p>
          </div>
        ) : (
          tweets.map(tweet => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onUpdate={fetchTweets}
            />
          ))
        )}
      </MainContent>

      <Sidebar>
        {user?.is_staff && (
          <div style={{ marginBottom: '20px' }}>
            <a
              href="http://localhost:8001/admin/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                background: '#14171A',
                color: 'white',
                textAlign: 'center',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxSizing: 'border-box'
              }}
            >
              Access Admin Panel
            </a>
          </div>
        )}
        <TopicsContainer>
          <TopicsTitle>Political Topics</TopicsTitle>
          <TopicItem
            active={!selectedTopic}
            onClick={() => handleTopicFilter('')}
          >
            <TopicName>All Topics</TopicName>
            <TopicCount>{tweets.length} tweets</TopicCount>
          </TopicItem>
          {topics.map(topic => (
            <TopicItem
              key={topic.id}
              active={selectedTopic === topic.id.toString()}
              onClick={() => handleTopicFilter(topic.id.toString())}
            >
              <TopicName>{topic.name}</TopicName>
              <TopicCount>{topic.tweet_count} tweets</TopicCount>
            </TopicItem>
          ))}
        </TopicsContainer>
      </Sidebar>
    </HomeContainer>
  );
};

export default Home;