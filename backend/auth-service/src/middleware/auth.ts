import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppDataSource } from '../utils/database';
import { User } from '../models/user';
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
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 토큰 추출
      token = req.headers.authorization.split(' ')[1];

      // 토큰 검증
      const decoded = verifyToken(token);

      // 사용자 정보 조회
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        res.status(401);
        throw new Error('사용자를 찾을 수 없습니다');
      }

      // 요청 객체에 사용자 정보 추가
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      next();
    } catch (error) {
      logger.error('인증 오류', { error });
      res.status(401);
      throw new Error('인증되지 않은 요청입니다');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('인증 토큰이 없습니다');
  }
};
