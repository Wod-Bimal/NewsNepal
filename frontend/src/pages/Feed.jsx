import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import styled from 'styled-components';
import NewsForm from '../components/NewsForm.jsx';
import NewsCard from '../components/NewsCard.jsx';
import { newsService, topicService, sourceService, userService } from '../services/api.js';
import { BIAS_CONFIG } from '../utils/constants.js';

const TabsContainer = styled.div`
  display: flex;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const Tab = styled.button`
  flex: 1;
  padding: 14px;
  background: ${props => props.active ? '#1DA1F2' : 'white'};
  color: ${props => props.active ? 'white' : '#14171A'};
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${props => props.active ? '#1991DB' : '#F7F9FA'}; }
`;

const FeedContainer = styled.div`
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
  background: ${props => props.$active ? '#1DA1F2' : '#F7F9FA'};
  color: ${props => props.$active ? 'white' : '#14171A'};
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#1991DB' : '#E1E8ED'};
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

const LoadMoreButton = styled.button`
  display: block; width: 100%; padding: 14px; background: white; border: 1px solid #E1E8ED;
  border-radius: 12px; color: #1DA1F2; font-weight: 700; font-size: 15px; cursor: pointer;
  transition: all 0.2s; margin-bottom: 20px;
  &:hover { background: #F7F9FA; } &:disabled { color: #AAB8C2; cursor: not-allowed; }
`;

const Feed = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [biasFilter, setBiasFilter] = useState('all');
  const [sources, setSources] = useState([]);
  const [feedTab, setFeedTab] = useState('for-you');
  const [followingNews, setFollowingNews] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const nextPageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(async (append = false) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const params = { page: append ? nextPageRef.current + 1 : 1 };
      if (selectedTopic) params.topic = selectedTopic;
      if (searchQuery) params.search = searchQuery;
      if (biasFilter !== 'all') params.bias = biasFilter;

      const response = await newsService.getNews(params);
      const data = response.data.results || response.data;
      const next = response.data.next;
      setNews(prev => append ? [...prev, ...data] : data);
      setHasMore(!!next);
      nextPageRef.current = append ? nextPageRef.current + 1 : 1;
      setError(null);
    } catch {
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [selectedTopic, searchQuery, biasFilter]);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await topicService.getTopics();
      setTopics(response.data.results || response.data);
    } catch {
      // Topics sidebar is non-critical; fail silently
    }
  }, []);

  const fetchSources = useCallback(async () => {
    try {
      const response = await sourceService.getSources();
      setSources(response.data.results || response.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNews();
    fetchTopics();
    fetchSources();
  }, [fetchNews, fetchTopics, fetchSources]);

  const handleNewsCreated = () => {
    fetchNews();
  };

  const fetchFollowingFeed = useCallback(async () => {
    setLoadingFollowing(true);
    try {
      const profileRes = await userService.getPublicProfile(user.id);
      const followingIds = [];
      const followingRes = await userService.getFollowing(user.id);
      const users = followingRes.data || [];
      users.forEach(u => followingIds.push(u.id));

      if (followingIds.length === 0) {
        setFollowingNews([]);
        setLoadingFollowing(false);
        return;
      }

      const allNews = [];
      for (const uid of followingIds.slice(0, 5)) {
        try {
          const res = await userService.getUserNews(uid);
          allNews.push(...(res.data || []));
        } catch { /* skip */ }
      }
      allNews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFollowingNews(allNews);
    } catch { /* ignore */ }
    setLoadingFollowing(false);
  }, [user]);

  useEffect(() => {
    if (feedTab === 'following') {
      fetchFollowingFeed();
    }
  }, [feedTab, fetchFollowingFeed]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTopicFilter = (topicId) => {
    setSelectedTopic(topicId === selectedTopic ? '' : topicId);
  };

  if (loading && news.length === 0) {
    return (
      <FeedContainer>
        <MainContent>
          <LoadingContainer>
            <p>Loading news...</p>
          </LoadingContainer>
        </MainContent>
      </FeedContainer>
    );
  }

  return (
    <FeedContainer>
      <MainContent>
        <TabsContainer>
          <Tab active={feedTab === 'for-you'} onClick={() => setFeedTab('for-you')}>For You</Tab>
          <Tab active={feedTab === 'trending'} onClick={() => setFeedTab('trending')}>Trending</Tab>
          <Tab active={feedTab === 'following'} onClick={() => setFeedTab('following')}>Following</Tab>
        </TabsContainer>

        {feedTab === 'following' && (
          loadingFollowing ? (
            <div style={{ background: 'white', border: '1px solid #E1E8ED', borderRadius: '12px', padding: '40px 20px', marginBottom: '20px', textAlign: 'center', color: '#657786' }}>
              Loading your feed...
            </div>
          ) : followingNews.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid #E1E8ED', borderRadius: '12px', padding: '40px 20px', marginBottom: '20px', textAlign: 'center', color: '#657786' }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No posts from people you follow</p>
              <p style={{ fontSize: 14 }}>Follow users to see their posts here.</p>
            </div>
          ) : null
        )}

        {feedTab === 'following' && followingNews.length > 0 && null}

        <NewsForm onNewsCreated={handleNewsCreated} />

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        {error && (
          <ErrorContainer>
            {error}
          </ErrorContainer>
        )}

        {feedTab === 'following' && followingNews.length > 0 ? (
          followingNews.map((item) => (
            <NewsCard
              key={item.id}
              newsItem={item}
              onUpdate={fetchFollowingFeed}
            />
          ))
        ) : feedTab !== 'following' ? (
          news.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#657786' }}>
              <p>No news posts found. Be the first to share an update!</p>
            </div>
          ) : (
            news.map((item) => (
              <NewsCard
                key={item.id}
                newsItem={item}
                onUpdate={fetchNews}
              />
            ))
          )
        ) : null}
        {hasMore && news.length > 0 && (
          <LoadMoreButton onClick={() => fetchNews(true)} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load More'}
          </LoadMoreButton>
        )}
      </MainContent>

      <Sidebar>
        {user?.is_staff && (
          <div style={{ marginBottom: '20px' }}>
            <a
              href="http://localhost:8000/admin/"
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
          <TopicsTitle>Trending Topics</TopicsTitle>
          <TopicItem
            $active={!selectedTopic}
            onClick={() => handleTopicFilter('')}
          >
            <TopicName>All Topics</TopicName>
            <TopicCount>{news.length} news posts</TopicCount>
          </TopicItem>
          {topics.map(topic => (
            <TopicItem
              key={topic.id}
              $active={selectedTopic === topic.id.toString()}
              onClick={() => handleTopicFilter(topic.id.toString())}
            >
              <TopicName>{topic.name}</TopicName>
              <TopicCount>{topic.news_count} news posts</TopicCount>
            </TopicItem>
          ))}
        </TopicsContainer>

        <TopicsContainer style={{ marginTop: 20 }}>
          <TopicsTitle>Filter by Bias</TopicsTitle>
          <TopicItem $active={biasFilter === 'all'} onClick={() => setBiasFilter('all')}>
            <TopicName>All Sources</TopicName>
          </TopicItem>
          {Object.entries(BIAS_CONFIG).map(([key, cfg]) => (
            <TopicItem
              key={key}
              $active={biasFilter === key}
              onClick={() => setBiasFilter(key)}
            >
              <TopicName>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: cfg.color, marginRight: 8 }} />
                {cfg.label}
              </TopicName>
            </TopicItem>
          ))}
        </TopicsContainer>

        {sources.length > 0 && (
          <TopicsContainer style={{ marginTop: 20 }}>
            <TopicsTitle>Sources</TopicsTitle>
            {sources.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #F7F9FA', fontSize: 13 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: (BIAS_CONFIG[s.bias_rating] || {}).color || '#9CA3AF' }} />
                {s.name}
              </div>
            ))}
          </TopicsContainer>
        )}
      </Sidebar>
    </FeedContainer>
  );
};

export default Feed;