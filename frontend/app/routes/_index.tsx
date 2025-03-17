import { Link } from "@remix-run/react";
import { useAuthStore } from "~/store/auth";

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-6">
          RAG 시스템에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-center mb-8">
          문서 기반 질의응답을 위한 Retrieval-Augmented Generation 시스템
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          {isAuthenticated ? (
            <>
              <div className="text-center mb-4">
                <p className="text-xl">환영합니다, {user?.name}님!</p>
              </div>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                대시보드로 이동
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                로그인
              </Link>
              <Link
                to="/auth/register"
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-center"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
