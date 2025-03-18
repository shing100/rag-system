import { useNavigate } from "@remix-run/react";
import { useAuthStore } from "../../store/auth";

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <a href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 text-transparent bg-clip-text">
                                Uri
                            </a>
                        </div>
                        {isAuthenticated && (
                            <div className="ml-6 flex space-x-8">
                                <a
                                    href="/dashboard"
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                >
                                    대시보드
                                </a>
                                <a
                                    href="/dashboard/projects"
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                >
                                    프로젝트
                                </a>
                                <a
                                    href="/dashboard/documents"
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                >
                                    문서
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden md:block">
                                    <div className="ml-4 flex items-center md:ml-6">
                                        <div className="relative ml-3">
                                            <div className="flex items-center">
                                                <span className="mr-4 text-sm text-gray-700 dark:text-gray-300">
                                                    안녕하세요, {user?.name}님
                                                </span>
                                                <button
                                                    onClick={handleLogout}
                                                    className="rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    로그아웃
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-4">
                                <a
                                    href="/auth/login"
                                    className="rounded-md px-3 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    로그인
                                </a>
                                <a
                                    href="/auth/register"
                                    className="rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                                >
                                    회원가입
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 