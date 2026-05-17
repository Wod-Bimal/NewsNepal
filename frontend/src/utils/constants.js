// API endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    LOGOUT: '/api/auth/logout/',
    PROFILE: '/api/auth/profile/',
    UPDATE_PROFILE: '/api/auth/profile/update/',
  },
  TWEETS: {
    LIST: '/api/tweets/',
    CREATE: '/api/tweets/create/',
    DETAIL: (id) => `/api/tweets/${id}/`,
    DELETE: (id) => `/api/tweets/${id}/delete/`,
    LIKE: (id) => `/api/tweets/${id}/like/`,
    RETWEET: (id) => `/api/tweets/${id}/retweet/`,
  },
  TOPICS: {
    LIST: '/api/topics/',
  },
  COMMENTS: {
    CREATE: (tweetId) => `/api/tweets/${tweetId}/comments/`,
    LIKE: (id) => `/api/comments/${id}/like/`,
  },
};

// App constants
export const APP_CONFIG = {
  MAX_TWEET_LENGTH: 500,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  PAGINATION_SIZE: 20,
};

// UI constants
export const COLORS = {
  PRIMARY: '#1DA1F2',
  PRIMARY_HOVER: '#1991DB',
  SECONDARY: '#E1E8ED',
  SUCCESS: '#059669',
  ERROR: '#E0245E',
  WARNING: '#F59E0B',
  TEXT_PRIMARY: '#14171A',
  TEXT_SECONDARY: '#657786',
  BACKGROUND: '#F7F9FA',
  WHITE: '#FFFFFF',
};

export const BREAKPOINTS = {
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1200px',
};