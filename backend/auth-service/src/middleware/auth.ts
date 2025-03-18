import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../utils/logger';

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// JWT 토큰 검증 미들웨어
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다' });
    }

    const token = authHeader.split(' ')[1]; // Bearer 토큰 형식
    if (!token) {
      return res.status(401).json({ message: '유효한 토큰 형식이 아닙니다' });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, config.jwt.secret as string) as any;
    
    // 사용자 정보를 요청 객체에 저장
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    logger.error('토큰 검증 오류', { error });
    
    if ((error as Error).name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다' });
    }
    
    return res.status(401).json({ message: '유효하지 않은 토큰입니다' });
  }
};

// 관리자 권한 확인 미들웨어
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 구현 필요 - 사용자가 관리자인지 확인하는 로직
  // 지금은 단순히 예시로 넣음
  if (req.user && req.user.email.endsWith('@admin.com')) {
    next();
  } else {
    res.status(403).json({ message: '관리자 권한이 필요합니다' });
  }
};
