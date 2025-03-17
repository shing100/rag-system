import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Express Request 타입 확장
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

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // API 게이트웨이에서 이미 인증을 처리했으므로, 
  // 헤더에서 사용자 정보를 추출합니다
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userName = req.headers['x-user-name'];

  if (userId && userEmail) {
    req.user = {
      id: userId as string,
      email: userEmail as string,
      name: userName as string || 'User',
    };
    next();
  } else {
    logger.error('인증 정보 없음');
    res.status(401).json({ message: '인증되지 않은 요청입니다' });
  }
};
