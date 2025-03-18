import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        name?: string;
      };
    }
  }
}

// API 게이트웨이에서 전달된 사용자 정보를 읽는 미들웨어
export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    // API 게이트웨이는 헤더를 통해 인증된 사용자 정보를 전달
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    const userName = req.headers['x-user-name'];
    
    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }
    
    // 사용자 정보를 요청 객체에 저장
    req.user = {
      id: userId as string,
      email: userEmail as string,
      name: userName as string
    };
    
    next();
  } catch (error) {
    logger.error('인증 미들웨어 오류', { error });
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
};
