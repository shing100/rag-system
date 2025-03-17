import { Router } from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', protect, authController.verifyToken);
router.post('/reset-password/request', authController.requestPasswordReset);

export default router;
