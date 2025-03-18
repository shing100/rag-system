import { api } from './api';
import { useAuthStore } from '../store/auth';

export interface LoginRequest {
    email: string;
    password: string;
    [key: string]: unknown;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    [key: string]: unknown;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
    [key: string]: unknown;
}

// 개발 중 백엔드 API 연결 문제를 해결하기 위한 임시 모의 인증 기능
const mockUsers: { [email: string]: { id: string; email: string; name: string; password: string; } } = {};
const mockAuth = {
    register: (data: RegisterRequest): Promise<AuthResponse> => {
        console.log('모의 회원가입 사용 중:', data);

        if (mockUsers[data.email]) {
            return Promise.reject(new Error('이미 사용 중인 이메일입니다.'));
        }

        const user = {
            id: `user_${Date.now()}`,
            email: data.email,
            name: data.name,
            password: data.password,
        };

        mockUsers[data.email] = user;
        const token = `mock_token_${Date.now()}`;

        console.log('모의 회원가입 완료:', { user, token });
        return Promise.resolve({ user, token });
    },

    login: (data: LoginRequest): Promise<AuthResponse> => {
        console.log('모의 로그인 사용 중:', data);

        const user = mockUsers[data.email];

        if (!user) {
            return Promise.reject(new Error('존재하지 않는 사용자입니다.'));
        }

        if (user.password !== data.password) {
            return Promise.reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
        }

        const token = `mock_token_${Date.now()}`;
        console.log('모의 로그인 완료:', { user, token });

        return Promise.resolve({
            user: { id: user.id, email: user.email, name: user.name },
            token
        });
    }
};

// 개발 중 모의 인증 사용 여부 설정
const useMockAuth = true;

export const authService = {
    /**
     * 사용자 로그인
     * @param credentials 이메일과 비밀번호
     * @returns 로그인 성공 시 사용자 정보와 토큰
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            console.log('로그인 요청 시작:', { email: credentials.email });

            // 개발 중 백엔드 API 대신 모의 인증 사용
            if (useMockAuth) {
                const mockResponse = await mockAuth.login(credentials);
                useAuthStore.getState().login(mockResponse.user, mockResponse.token);
                return mockResponse;
            }

            // 요청 데이터 검증 로그
            if (!credentials.email || !credentials.password) {
                console.error('로그인 데이터 누락:', {
                    email: !!credentials.email,
                    password: !!credentials.password
                });
            }

            const response = await api.post('/auth/login', credentials);
            console.log('로그인 응답 받음:', response);

            if (response.user && response.token) {
                useAuthStore.getState().login(response.user, response.token);
                console.log('로그인 상태 저장 완료');
                return response;
            }

            console.error('로그인 응답이 예상과 다름:', response);
            throw new Error('로그인 후 사용자 정보를 받지 못했습니다');
        } catch (error) {
            console.error('로그인 실패 (try-catch):', error);
            throw error;
        }
    },

    /**
     * 사용자 회원가입
     * @param userData 이름, 이메일, 비밀번호 
     * @returns 회원가입 성공 시 사용자 정보와 토큰
     */
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            console.log('회원가입 요청 시작:', userData);

            // 개발 중 백엔드 API 대신 모의 인증 사용
            if (useMockAuth) {
                const mockResponse = await mockAuth.register(userData);
                useAuthStore.getState().login(mockResponse.user, mockResponse.token);
                return mockResponse;
            }

            // 요청 데이터 검증 로그
            if (!userData.email || !userData.password || !userData.name) {
                console.error('회원가입 데이터 누락:', {
                    email: !!userData.email,
                    password: !!userData.password,
                    name: !!userData.name
                });
            }

            const response = await api.post('/auth/register', userData);
            console.log('회원가입 응답 받음:', response);

            // 실제 응답 구조에 맞게 처리
            if (response.token && response.user) {
                useAuthStore.getState().login(response.user, response.token);
                console.log('회원가입 후 로그인 상태 저장 완료');
                return response;
            } else if (response.message) {
                // 백엔드가 다른 응답 형식을 반환하는 경우 처리
                console.log('백엔드가 다른 응답 형식 반환, 로그인 시도');

                // 로그인 필요한 경우
                const loginResponse = await api.post('/auth/login', {
                    email: userData.email,
                    password: userData.password
                });
                console.log('로그인 응답 받음:', loginResponse);

                if (loginResponse.user && loginResponse.token) {
                    useAuthStore.getState().login(loginResponse.user, loginResponse.token);
                    console.log('로그인 상태 저장 완료');
                    return loginResponse;
                }
            }

            console.error('회원가입/로그인 응답이 예상과 다름:', response);
            throw new Error('회원가입 후 사용자 정보를 받지 못했습니다');
        } catch (error) {
            console.error('회원가입 실패 (try-catch):', error);
            throw error;
        }
    },

    /**
     * 비밀번호 재설정 요청
     * @param email 사용자 이메일
     */
    async forgotPassword(email: string): Promise<void> {
        try {
            await api.post('/auth/forgot-password', { email });
        } catch (error) {
            console.error('비밀번호 재설정 요청 실패:', error);
            throw error;
        }
    },

    /**
     * 로그아웃
     */
    logout(): void {
        useAuthStore.getState().logout();
    },

    /**
     * 토큰 확인 (백엔드 연결되면 구현)
     */
    async verifyToken(): Promise<boolean> {
        try {
            const token = useAuthStore.getState().token;
            if (!token) return false;

            // 개발 중 백엔드 API 대신 모의 인증 사용
            if (useMockAuth) {
                return true;
            }

            // 백엔드 연결 시 실제 API 호출 추가
            await api.get('/auth/me');
            return true;
        } catch (error) {
            console.error('토큰 검증 실패:', error);
            useAuthStore.getState().logout();
            return false;
        }
    }
}; 