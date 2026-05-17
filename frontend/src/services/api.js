import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for CSRF
});

// Function to get CSRF token from cookies
function getCsrfToken() {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
}

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      config.headers['X-CSRFToken'] = getCsrfToken();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
  getProfile: () => api.get(API_ENDPOINTS.AUTH.PROFILE),
  updateProfile: (profileData) => api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData),
};

// Tweet services
export const tweetService = {
  getTweets: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`${API_ENDPOINTS.TWEETS.LIST}?${queryString}`);
  },
  createTweet: (tweetData) => {
    const formData = new FormData();
    Object.entries(tweetData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return api.post(API_ENDPOINTS.TWEETS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getTweet: (id) => api.get(API_ENDPOINTS.TWEETS.DETAIL(id)),
  deleteTweet: (id) => api.delete(API_ENDPOINTS.TWEETS.DELETE(id)),
  likeTweet: (id) => api.post(API_ENDPOINTS.TWEETS.LIKE(id)),
  retweet: (id) => api.post(API_ENDPOINTS.TWEETS.RETWEET(id)),
};

// Topic services
export const topicService = {
  getTopics: () => api.get(API_ENDPOINTS.TOPICS.LIST),
};

// Comment services
export const commentService = {
  createComment: (tweetId, commentData) => 
    api.post(API_ENDPOINTS.COMMENTS.CREATE(tweetId), commentData),
  likeComment: (id) => api.post(API_ENDPOINTS.COMMENTS.LIKE(id)),
};

export default api;