import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getApiUrl } from "../utils/env";

/**
 * API 프록시 - 클라이언트의 /api/* 요청을 백엔드 API 게이트웨이로 전달
 * 이 파일은 /api/* 경로로 들어오는 모든 요청을 처리합니다.
 */

export async function loader({ request }: LoaderFunctionArgs) {
    return handleApiRequest(request);
}

export async function action({ request }: ActionFunctionArgs) {
    return handleApiRequest(request);
}

async function handleApiRequest(request: Request) {
    // 요청 URL에서 /api/ 이후의 경로 추출
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, "");

    // 쿼리 파라미터 유지
    const apiUrl = `${getApiUrl()}${path}${url.search}`;

    // 원본 요청의 메서드, 헤더, 본문 유지
    const headers = new Headers(request.headers);

    // 호스트 헤더 제거 (프록시 시 문제 발생 방지)
    headers.delete("host");

    try {
        // API 게이트웨이로 요청 전달
        const response = await fetch(apiUrl, {
            method: request.method,
            headers,
            body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : undefined,
            redirect: "manual",
        });

        // 응답 헤더 구성
        const responseHeaders = new Headers(response.headers);

        // 새로운 Response 생성 및 반환
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("API 프록시 오류:", error);
        return new Response(JSON.stringify({ error: "API 서버에 연결할 수 없습니다." }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
} 