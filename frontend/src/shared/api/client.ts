import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.PROD
    ? '/api/v1'
    : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // ★ Cookieの送受信に必須！
  headers: {
    'Content-Type': 'application/json',
  },
});