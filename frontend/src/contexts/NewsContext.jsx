import React, { createContext, useContext, useState, useCallback } from 'react';
import { newsService } from '../services/api.js';

const NewsContext = createContext();

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsService.getNews(params);
      setNews(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNews = useCallback(async (newsData) => {
    try {
      setError(null);
      const response = await newsService.createNews(newsData);
      setNews(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data || 'Failed to create news post';
      setError(error);
      return { success: false, error };
    }
  }, []);

  const deleteNews = useCallback(async (newsId) => {
    try {
      setError(null);
      await newsService.deleteNews(newsId);
      setNews(prev => prev.filter(item => item.id !== newsId));
      return { success: true };
    } catch (err) {
      const error = err.response?.data || 'Failed to delete news post';
      setError(error);
      return { success: false, error };
    }
  }, []);

  const likeNews = useCallback(async (newsId) => {
    try {
      const response = await newsService.likeNews(newsId);
      setNews(prev => prev.map(item => 
        item.id === newsId 
          ? { ...item, is_liked: response.data.liked, like_count: response.data.like_count }
          : item
      ));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  }, []);

  const shareNews = useCallback(async (newsId) => {
    try {
      const response = await newsService.shareNews(newsId);
      setNews(prev => prev.map(item => 
        item.id === newsId 
          ? { ...item, is_shared: response.data.shared, share_count: response.data.share_count }
          : item
      ));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    news,
    loading,
    error,
    fetchNews,
    createNews,
    deleteNews,
    likeNews,
    shareNews,
    clearError,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};
