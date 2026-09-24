import axios from 'axios';

// Centralized Axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('schoolerp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // Token expired or unauthorized
        localStorage.removeItem('schoolerp_token');
        localStorage.removeItem('schoolerp_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
      }
      return Promise.reject(data?.message || `Server error (${status})`);
    } else if (error.request) {
      return Promise.reject('Network connection error. Check backend server.');
    }
    return Promise.reject(error.message || 'An unexpected error occurred.');
  }
);

export default api;
