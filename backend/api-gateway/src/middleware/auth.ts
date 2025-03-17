import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config';

// 임시 인터페이스 (실제 구현 때 확장 필요)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 토큰 추출
      token = req.headers.authorization.split(' ')[1];

      // 임시 테스트 코드 (백엔드 인증 서비스 완성 전까지 사용)
      if (token === 'dummy-token') {
        req.user = {
          id: '1',
          email: 'test@example.com',
          name: '테스트 사용자',
        };
        return next();
      }

      // 실제 인증 서비스 호출 코드 (추후 구현)
      // const { data } = await axios.get(`${config.authServiceUrl}/api/auth/verify`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // req.user = data.user;

      next();
    } catch (error) {
      res.status(401);
      throw new Error('인증되지 않은 요청입니다');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('인증 토큰이 없습니다');
  }
};
