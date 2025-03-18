/**
 * 환경 변수 유틸리티 - 서버와 클라이언트에서 환경 변수에 안전하게 접근
 */

// 클라이언트 측 환경 변수 접근 함수
export function getClientEnv(key: string, defaultValue: string = ''): string {
    // Vite는 클라이언트 측 코드에서 import.meta.env.VITE_* 변수에 접근할 수 있도록 함
    if (typeof window !== 'undefined') {
        try {
            // @ts-expect-error - Vite 환경 변수 접근은 타입 정의가 없음
            const value = import.meta.env[key];
            return value || defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }
    return defaultValue;
}

// 서버 측 환경 변수 접근 함수
export function getServerEnv(key: string, defaultValue: string = ''): string {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || defaultValue;
    }
    return defaultValue;
}

// API URL 가져오기
export function getApiUrl(): string {
    // 서버 측에서는 API_URL 환경 변수 사용
    if (typeof window === 'undefined') {
        return getServerEnv('API_URL', 'http://api-gateway:4000');
    }

    // 클라이언트 측에서는 VITE_API_URL 환경 변수 사용
    return getClientEnv('VITE_API_URL', 'http://localhost:4010');
}

// API 기본 경로
export const API_BASE_PATH = '/api'; 