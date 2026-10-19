// Shared Admin API client (axios) with token handling and global 401 handling
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach admin token from sessionStorage
adminApi.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem('furko_admin_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler: handle 401 (expired / unauthorized)
// Redirect to admin login and clear stored admin session
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        sessionStorage.removeItem('furko_admin_token');
        sessionStorage.removeItem('furko_admin_user');
      } catch (e) {}
      // Navigate to admin login page. Query param signals expired session.
      window.location.href = '/admin/login?expired=1';
    }
    return Promise.reject(error);
  }
);

export default adminApi;