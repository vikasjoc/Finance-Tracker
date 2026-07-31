import axios from 'axios';
import toast from 'react-hot-toast';

// Determine the base URL for API calls
// Priority: VITE_API_URL env var > production detection > local dev proxy
const getBaseURL = () => {
  // 1. VITE_API_URL set in Vercel dashboard (recommended approach)
  if (import.meta.env.VITE_API_URL) {
    // Remove trailing slash if present
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  // 2. Auto-detect production by hostname
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Fallback: custom Render backend URL (change this if your Render URL changes)
    return 'https://finance-tracker-api-mi3y.onrender.com/api';
  }
  // 3. Local development - use Vite's proxy (see vite.config.js)
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    }

    return Promise.reject(error);
  }
);

export default API;
