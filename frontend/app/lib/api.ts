import axios, { InternalAxiosRequestConfig } from 'axios';

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

// 개발 환경에서 사용할 더미 토큰 (실제 배포 시 제거)
const DUMMY_TOKEN = 'dummy-token-for-development';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 개발 중에는 항상 더미 토큰 사용 (실제 배포 시 제거)
    const token = DUMMY_TOKEN;

    // 실제 로직 (배포 시 주석 해제)
    // const token = localStorage.getItem('auth-storage')
    //   ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token
    //   : null;

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
