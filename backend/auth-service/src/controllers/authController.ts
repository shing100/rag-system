import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { User } from '../models/user';
import { generateToken } from '../utils/jwt';
import logger from '../utils/logger';

const userRepository = AppDataSource.getRepository(User);

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 이미 존재하는 이메일인지 확인
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다' });
    }

    // 새 사용자 생성
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    
    // 비밀번호 해싱
    await user.hashPassword();
    
    // 데이터베이스에 저장
    await userRepository.save(user);

    res.status(201).json({
      message: '회원가입이 완료되었습니다',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('회원가입 오류', { error });
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다' });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // 토큰 생성
    const token = generateToken(user);

    res.json({
      message: '로그인 성공',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    logger.error('로그인 오류', { error });
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다' });
  }
};

// 토큰 검증
export const verifyToken = async (req: Request, res: Response) => {
  // 이 엔드포인트에 도달했다면 이미 인증 미들웨어를 통과한 것
  res.json({
    user: req.user,
  });
};

// 비밀번호 재설정 요청
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      // 보안을 위해 사용자가 없더라도 성공 응답
      return res.json({ message: '비밀번호 재설정 링크가 이메일로 전송되었습니다' });
    }

    // 실제 환경에서는 이메일 발송 로직 구현
    // TODO: 이메일 서비스 연동

    res.json({ message: '비밀번호 재설정 링크가 이메일로 전송되었습니다' });
  } catch (error) {
    logger.error('비밀번호 재설정 요청 오류', { error });
    res.status(500).json({ message: '비밀번호 재설정 요청 중 오류가 발생했습니다' });
  }
};
