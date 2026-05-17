import React, { createContext, useContext, useState, useCallback } from 'react';
import { tweetService } from '../services/api.js';

const TweetContext = createContext();

export const useTweets = () => {
  const context = useContext(TweetContext);
  if (!context) {
    throw new Error('useTweets must be used within a TweetProvider');
  }
  return context;
};

export const TweetProvider = ({ children }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTweets = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tweetService.getTweets(params);
      setTweets(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch tweets');
      console.error('Error fetching tweets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTweet = useCallback(async (tweetData) => {
    try {
      setError(null);
      const response = await tweetService.createTweet(tweetData);
      setTweets(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data || 'Failed to create tweet';
      setError(error);
      return { success: false, error };
    }
  }, []);

  const deleteTweet = useCallback(async (tweetId) => {
    try {
      setError(null);
      await tweetService.deleteTweet(tweetId);
      setTweets(prev => prev.filter(tweet => tweet.id !== tweetId));
      return { success: true };
    } catch (err) {
      const error = err.response?.data || 'Failed to delete tweet';
      setError(error);
      return { success: false, error };
    }
  }, []);

  const likeTweet = useCallback(async (tweetId) => {
    try {
      const response = await tweetService.likeTweet(tweetId);
      setTweets(prev => prev.map(tweet => 
        tweet.id === tweetId 
          ? { ...tweet, is_liked: response.data.liked, like_count: response.data.like_count }
          : tweet
      ));
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error liking tweet:', err);
      return { success: false, error: err.response?.data };
    }
  }, []);

  const retweet = useCallback(async (tweetId) => {
    try {
      const response = await tweetService.retweet(tweetId);
      setTweets(prev => prev.map(tweet => 
        tweet.id === tweetId 
          ? { ...tweet, is_retweeted: response.data.retweeted, retweet_count: response.data.retweet_count }
          : tweet
      ));
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error retweeting:', err);
      return { success: false, error: err.response?.data };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    tweets,
    loading,
    error,
    fetchTweets,
    createTweet,
    deleteTweet,
    likeTweet,
    retweet,
    clearError,
  };

  return (
    <TweetContext.Provider value={value}>
      {children}
    </TweetContext.Provider>
  );
};