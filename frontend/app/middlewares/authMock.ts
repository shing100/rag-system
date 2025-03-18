/**
 * 인증 API를 모킹하는 미들웨어
 * 
 * 백엔드 개발이 완료되기 전에 프론트엔드 테스트를 위한 임시 구현입니다.
 * 실제 서버가 구현되면 이 파일은 제거하고 실제 API를 사용하세요.
 */

import { json } from "@remix-run/node";
import type { NextFunction, Request, Response } from "express";

// 임시 사용자 데이터 저장소
const users = [
    {
        id: "1",
        email: "admin@uri.com",
        password: "password123",
        name: "관리자"
    }
];

// 임시 토큰 저장소
const tokens: Record<string, string> = {};

/**
 * 요청 경로를 기반으로 모의 인증 핸들러를 반환합니다.
 */
export function mockAuthApi(req: Request, res: Response, next: NextFunction) {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;

    // 로그인 요청 처리
    if (path === "/api/auth/login" && req.method === "POST") {
        const { email, password } = req.body;
        const user = users.find(user => user.email === email && user.password === password);

        if (!user) {
            return json(
                { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
                { status: 401 }
            );
        }

        const token = `mock-token-${Date.now()}`;
        tokens[user.id] = token;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pwd, ...userWithoutPassword } = user;
        return json({
            user: userWithoutPassword,
            token
        });
    }

    // 회원가입 요청 처리
    if (path === "/api/auth/register" && req.method === "POST") {
        const { name, email, password } = req.body;

        // 이메일 중복 확인
        if (users.some(user => user.email === email)) {
            return json(
                { error: "이미 등록된 이메일 주소입니다." },
                { status: 400 }
            );
        }

        // 새 사용자 생성
        const newUser = {
            id: `${users.length + 1}`,
            email,
            password,
            name
        };

        users.push(newUser);

        const token = `mock-token-${Date.now()}`;
        tokens[newUser.id] = token;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pwd, ...userWithoutPassword } = newUser;
        return json({
            user: userWithoutPassword,
            token
        });
    }

    // 토큰 확인 요청
    if (path === "/api/auth/verify" && req.method === "GET") {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return json({ valid: false }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const userId = Object.entries(tokens).find(([id, t]) => t === token)?.[0];

        if (!userId) {
            return json({ valid: false }, { status: 401 });
        }

        return json({ valid: true });
    }

    // 다른 요청은 다음 미들웨어로 전달
    next();
} 