// ============================================
// CONFIGURATION AXIOS
// ============================================

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes
});

// Intercepteur pour ajouter le token JWT (token = clé utilisée à la connexion)
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') return config;
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs (401 = token expiré ou invalide)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
