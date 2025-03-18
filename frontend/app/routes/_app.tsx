import { Outlet } from "@remix-run/react";
import Navbar from "../components/layout/Navbar";

/**
 * 앱의 기본 레이아웃을 정의합니다.
 * '_app' 경로는 모든 하위 경로들의 부모 레이아웃이 됩니다.
 */
export default function AppLayout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <Outlet />
        </div>
    );
} 