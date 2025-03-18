import { Link } from "@remix-run/react";
import { useAuthStore } from "~/store/auth";

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab?: 'dashboard' | 'projects';
    title?: string;
    rightButton?: React.ReactNode;
    backLink?: {
        to: string;
        label?: string;
    };
}

export default function DashboardLayout({
    children,
    activeTab = 'dashboard',
    title,
    rightButton,
    backLink,
}: DashboardLayoutProps) {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">RAG 시스템</span>
                            </div>
                            <div className="ml-6 flex space-x-8">
                                <Link
                                    to="/dashboard"
                                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${activeTab === 'dashboard'
                                        ? 'border-blue-500 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                >
                                    대시보드
                                </Link>
                                <Link
                                    to="/dashboard/projects"
                                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${activeTab === 'projects'
                                        ? 'border-blue-500 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                >
                                    프로젝트
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-sm text-gray-700 dark:text-gray-300">안녕하세요, {user?.name}님</span>
                            <button
                                onClick={logout}
                                className="rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {(title || backLink || rightButton) && (
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center">
                                {backLink && (
                                    <Link
                                        to={backLink.to}
                                        className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        aria-label="뒤로 가기"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </Link>
                                )}
                                {title && (
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                                )}
                            </div>
                            {rightButton && (
                                <div>{rightButton}</div>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}