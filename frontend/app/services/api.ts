import { json } from "@remix-run/node";
import { getApiUrl, API_BASE_PATH } from "../utils/env";
import { useAuthStore } from "../store/auth";

// API 요청 기본 URL 가져오기
const getApiBaseUrl = () => {
    let url: string;
    if (typeof window === "undefined") {
        url = getApiUrl(); // 서버 측에서는 환경 변수 URL 사용
    } else {
        url = API_BASE_PATH; // 클라이언트 측에서는 상대 경로 사용 (API 게이트웨이로 프록시됨)
    }

    console.log('API 베이스 URL:', url);
    return url;
};

// 인증 토큰 가져오기
const getAuthToken = () => {
    if (typeof window === "undefined") {
        return null; // 서버 측에서는 토큰 없음
    }

    // 클라이언트 측에서는 스토어에서 토큰 가져오기
    const authState = useAuthStore.getState();
    return authState.token;
};

// API 호출을 위한 기본 fetch 함수
export async function apiCall(endpoint: string, options: RequestInit = {}) {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    console.log(`API 호출: ${options.method || 'GET'} ${url}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Endpoint: ${endpoint}`);

    // 기본 헤더 설정
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {})
    };

    // 인증 토큰이 있으면 헤더에 추가
    const token = getAuthToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("인증 토큰 헤더 추가됨");
    } else {
        console.log("인증 토큰 없음");
    }

    try {
        // 요청 본문이 있는 경우 로깅
        if (options.body) {
            console.log('요청 데이터:', options.body);
            try {
                const jsonBody = JSON.parse(options.body as string);
                console.log('요청 JSON 데이터:', jsonBody);
            } catch (e) {
                console.log('요청 본문 파싱 실패 (JSON이 아님)');
            }
        } else {
            console.log('요청 본문 없음');
        }

        console.log('요청 헤더:', headers);

        // 실제 fetch 호출
        console.log('Fetch 호출 시작...');
        const response = await fetch(url, {
            ...options,
            headers,
        });
        console.log('Fetch 응답 수신');

        // 응답 상태 로깅
        console.log(`응답 상태: ${response.status} ${response.statusText}`);
        console.log('응답 헤더:', Object.fromEntries([...response.headers.entries()]));

        // JSON 응답이 아닌 경우를 처리
        const contentType = response.headers.get("content-type");
        console.log(`응답 콘텐츠 타입: ${contentType}`);

        if (contentType && contentType.includes("application/json")) {
            console.log('JSON 응답 파싱 중...');
            const data = await response.json();
            console.log('응답 데이터:', data);

            if (!response.ok) {
                console.error(`API 오류 응답: ${response.status}`, data);
                throw { status: response.status, data };
            }

            return data;
        } else {
            console.log('텍스트 응답 파싱 중...');
            const text = await response.text();
            console.log('응답 텍스트:', text);

            if (!response.ok) {
                console.error(`API 오류 응답: ${response.status}`, text);
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