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
  NEWS: {
    LIST: '/api/news/',
    DETAIL: (id) => `/api/news/${id}/`,
    LIKE: (id) => `/api/news/${id}/like/`,
  },
  TOPICS: {
    LIST: '/api/topics/',
  },
  SOURCES: {
    LIST: '/api/sources/',
    DETAIL: (id) => `/api/sources/${id}/`,
  },
  COMMENTS: {
    LIST: (newsId) => `/api/news/${newsId}/comments/`,
    CREATE: (newsId) => `/api/news/${newsId}/comments/`,
    LIKE: (newsId, id) => `/api/news/${newsId}/comments/${id}/like/`,
    DELETE: (newsId, id) => `/api/news/${newsId}/comments/${id}/`,
  },
  BIAS: {
    VOTE: (newsId) => `/api/news/${newsId}/bias/`,
  },
};

// App constants
export const APP_CONFIG = {
  MAX_NEWS_LENGTH: 500,
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

export const BIAS_CONFIG = {
  center: { label: 'Centrist', color: '#059669' },
  left: { label: 'Leaning Left', color: '#2563EB' },
  right: { label: 'Leaning Right', color: '#DC2626' },
  left_extreme: { label: 'Far Left', color: '#1E3A5F' },
  right_extreme: { label: 'Far Right', color: '#7F1D1D' },
  sensationalist: { label: 'Sensationalist', color: '#D97706' },
  unknown: { label: 'Unknown', color: '#9CA3AF' },
};

export const BREAKPOINTS = {
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1200px',
};