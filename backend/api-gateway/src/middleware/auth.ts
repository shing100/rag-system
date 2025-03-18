import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

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
  // 개발 중에는 항상 인증 통과 (실제 배포 시 제거)
  req.user = {
    id: 'dev-user-id',
    email: 'dev@example.com',
    name: '개발자 사용자'
  };
  return next();

  // 실제 인증 로직 (배포 시 주석 해제)
  /*
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 토큰 추출
      token = req.headers.authorization.split(' ')[1];

      // 인증 서비스 호출
      try {
        const { data } = await axios.get(`${config.authServiceUrl}/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (data && data.user) {
          req.user = data.user;
          return next();
        } else {
          throw new Error('인증 서비스에서 사용자 정보를 반환하지 않았습니다');
        }
      } catch (error) {
        logger.error('인증 서비스 호출 중 오류', { error });
        res.status(401);
        throw new Error('인증되지 않은 요청입니다');
      }
    } catch (error) {
      logger.error('인증 처리 중 오류', { error });
      res.status(401);
      throw new Error('인증되지 않은 요청입니다');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('인증 토큰이 없습니다');
  }
  */
};
