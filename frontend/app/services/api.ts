import { json } from "@remix-run/node";
import { getApiUrl, API_BASE_PATH } from "../utils/env";

// API 요청 기본 URL 가져오기
const getApiBaseUrl = () => {
    if (typeof window === "undefined") {
        return getApiUrl(); // 서버 측에서는 환경 변수 URL 사용
    }
    return API_BASE_PATH; // 클라이언트 측에서는 상대 경로 사용 (API 게이트웨이로 프록시됨)
};

// API 호출을 위한 기본 fetch 함수
export async function apiCall(endpoint: string, options: RequestInit = {}) {
    const url = `${getApiBaseUrl()}${endpoint}`;

    // 기본 헤더 설정
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // JSON 응답이 아닌 경우를 처리
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (!response.ok) {
                throw { status: response.status, data };
            }

            return data;
        } else {
            const text = await response.text();

            if (!response.ok) {
                throw { status: response.status, data: text };
            }

            return text;
        }
    } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
        throw error;
    }
}

// 다양한 HTTP 메서드를 위한 헬퍼 함수들
export const api = {
    get: (endpoint: string, options: RequestInit = {}) =>
        apiCall(endpoint, { ...options, method: "GET" }),

    post: <T extends Record<string, unknown>>(endpoint: string, data: T, options: RequestInit = {}) =>
        apiCall(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data)
        }),

    put: <T extends Record<string, unknown>>(endpoint: string, data: T, options: RequestInit = {}) =>
        apiCall(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data)
        }),

    delete: (endpoint: string, options: RequestInit = {}) =>
        apiCall(endpoint, { ...options, method: "DELETE" }),

    // 파일 업로드를 위한 함수
    upload: (endpoint: string, formData: FormData, options: RequestInit = {}) => {
        // multipart/form-data 헤더 처리를 위한 새 options 객체 생성
        const newOptions = { ...options };

        // Headers 객체가 있으면 복사하고, 없으면 새로 생성
        const newHeaders = new Headers(newOptions.headers || {});

        // Content-Type 헤더 제거 (브라우저가 자동으로 multipart/form-data 설정)
        newHeaders.delete("Content-Type");

        return apiCall(endpoint, {
            ...newOptions,
            method: "POST",
            body: formData,
            headers: Object.fromEntries(newHeaders.entries())
        });
    }
};

// Remix 액션/로더에서 에러 응답을 생성하는 헬퍼
export function handleApiError(error: unknown) {
    if (typeof error === 'object' && error !== null && 'status' in error && 'data' in error) {
        const apiError = error as { status: number; data: unknown };
        return json(
            { error: apiError.data },
            { status: apiError.status }
        );
    }

    return json(
        { error: "서버 연결 중 오류가 발생했습니다. 나중에 다시 시도해주세요." },
        { status: 500 }
    );
} 