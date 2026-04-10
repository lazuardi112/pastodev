import axios from 'axios';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors (jangan redirect saat login/register gagal — itu 401/400 biasa)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? '');
    const isAuthAttempt =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/login-google');
    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    if (
      status === 503 &&
      error.response?.data?.maintenance === true &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/maintenance') &&
      !url.includes('/public/') &&
      !url.includes('/settings/public')
    ) {
      try {
        sessionStorage.setItem('maintenance_message', String(error.response?.data?.message ?? ''));
      } catch {
        /* */
      }
      window.location.href = '/maintenance';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
