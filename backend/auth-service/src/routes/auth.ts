import { Router } from 'express';
import * as authController from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// 인증 관련 라우트
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getCurrentUser);
router.get('/verify', verifyToken, authController.verifyToken);
router.post('/reset-password/request', authController.requestPasswordReset);
router.post('/reset-password/confirm', authController.confirmPasswordReset);

export default router;
