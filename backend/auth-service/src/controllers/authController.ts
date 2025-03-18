import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/user';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import logger from '../utils/logger';

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: '모든 필드를 입력하세요' });
    }

    const userRepository = getRepository(User);

    // 이메일 중복 확인
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다' });
    }

    // 비밀번호 해시화
    const hashedPassword = await hashPassword(password);

    // 새 사용자 생성
    const user = userRepository.create({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
      authProvider: 'local'
    });

    await userRepository.save(user);

    res.status(201).json({
      message: '회원가입이 완료되었습니다',
      userId: user.id
    });
  } catch (error) {
    logger.error('회원가입 처리 중 오류 발생', { error });
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요' });
    }

    const userRepository = getRepository(User);

    // 비밀번호 조회를 위해 select 옵션 사용
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'password', 'emailVerified'] // 비밀번호 필드 명시적 선택
    });

    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // 비밀번호 확인
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.status(200).json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    logger.error('로그인 처리 중 오류 발생', { error });
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
};

// 로그아웃 (클라이언트에서 토큰을 삭제하므로 서버에서는 특별한 처리 없음)
export const logout = (req: Request, res: Response) => {
  res.status(200).json({ message: '로그아웃 성공' });
};

// 비밀번호 재설정 요청
export const requestPasswordReset = async (req: Request, res: Response) => {
  // 구현 필요
  res.status(501).json({ message: '아직 구현되지 않은 기능입니다' });
};

// 비밀번호 재설정 확인
export const confirmPasswordReset = async (req: Request, res: Response) => {
  // 구현 필요
  res.status(501).json({ message: '아직 구현되지 않은 기능입니다' });
};

// 현재 사용자 정보 조회
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      emailVerified: user.emailVerified,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    });
  } catch (error) {
    logger.error('사용자 정보 조회 중 오류 발생', { error });
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
};
