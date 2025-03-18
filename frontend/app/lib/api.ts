import axios, { AxiosRequestConfig } from 'axios';

// Window에 ENV 속성 추가
declare global {
  interface Window {
    ENV?: {
      API_URL?: string;
    };
  }
}

const API_URL = typeof window !== 'undefined'
  ? window.ENV?.API_URL || 'http://localhost:4010'
  : process.env.API_URL || 'http://localhost:4010';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token
      : null;

    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

export default api;
