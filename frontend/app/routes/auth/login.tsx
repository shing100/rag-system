import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';
import { useAuthStore } from '../../store/auth';
import { authService } from '../../services/auth.service';
import Navbar from '../../components/layout/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 이미 로그인되어 있으면 대시보드로 리다이렉트
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // 회원가입 성공 등의 메시지가 있으면 표시
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    // 1. 폼 기본 동작 방지
    e.preventDefault();
    e.stopPropagation();

    // URL 변경 방지를 위한 추가 코드
    if (e.target instanceof HTMLFormElement) {
      // 폼의 action과 method 속성 강제 제거 
      e.target.setAttribute('action', 'javascript:void(0);');
      e.target.removeAttribute('method');
    }

    // 2. 상태 초기화
    setError('');
    setIsLoading(true);
    setSuccessMessage(null);

    // 3. 입력 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      // 4. 로그인 시도 중임을 사용자에게 알림
      setSuccessMessage('로그인 중입니다...');
      console.log('로그인 시도:', { email });

      // 5. 실제 API 호출
      await authService.login({ email, password });

      // 6. 성공 처리
      setSuccessMessage('로그인 성공! 대시보드로 이동합니다...');

      // 7. 대시보드로 리다이렉트 전에 잠시 성공 메시지 표시
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: unknown) {
      console.error('로그인 오류:', error);
      setSuccessMessage(null);

      // 8. 오류 메시지 처리
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === 'object' && error !== null && 'data' in error) {
        const apiError = error as { data?: { message?: string; error?: string } | string };
        // 다양한 오류 응답 형식 처리
        let errorMessage = '로그인 중 오류가 발생했습니다.';

        if (apiError.data) {
          if (typeof apiError.data === 'object') {
            errorMessage = apiError.data.message || apiError.data.error || errorMessage;
          } else if (typeof apiError.data === 'string') {
            errorMessage = apiError.data;
          }
        }

        setError(errorMessage);
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
            Uri 계정에 로그인하세요
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                이메일 주소
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 px-2 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                  비밀번호
                </label>
                <div className="text-sm">
                  <a href="/auth/forgot-password" className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 px-2 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-purple-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:bg-purple-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            계정이 없으신가요?{' '}
            <a href="/auth/register" className="font-semibold leading-6 text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
              회원가입하기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
