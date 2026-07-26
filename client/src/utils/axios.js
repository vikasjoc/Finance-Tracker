import axios from 'axios';
import toast from 'react-hot-toast';

// Determine the base URL for API calls
// In production, VITE_API_URL should point to the deployed backend
// In development, we proxy through Vite's dev server
const getBaseURL = () => {
  // Check if running in production (VITE_API_URL would be set in deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development, use Vite's proxy
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

