import { Outlet } from "@remix-run/react";

/**
 * 인증 관련 페이지의 레이아웃을 정의합니다.
 * '_app.auth' 경로는 /auth/* 경로들의 부모 레이아웃이 됩니다.
 */
export default function AuthLayout() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center px-6 py-12 lg:px-8">
            <Outlet />
        </div>
    );
} 