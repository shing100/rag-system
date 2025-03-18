import { Router } from 'express';
import { createServiceProxy } from '../proxies/serviceProxy';
import config from '../config';
import { protect } from '../middleware/auth';
import { summarizeConversation } from '../controllers/rag.controller';

const router = Router();

// 루트 경로
router.get('/', (req, res) => {
  res.json({ message: 'RAG 시스템 API 게이트웨이에 오신 것을 환영합니다' });
});

// 인증 관련 라우트
router.use('/api/auth', createServiceProxy('auth-service', config.authServiceUrl));

// 인증이 필요한 라우트
router.use('/api/users', protect, createServiceProxy('user-service', config.userServiceUrl));
router.use('/api/projects', protect, createServiceProxy('project-service', config.projectServiceUrl));
router.use('/api/documents', protect, createServiceProxy('document-service', config.documentServiceUrl));
router.use('/api/queries', protect, createServiceProxy('rag-service', config.ragServiceUrl));
router.use('/api/analytics', protect, createServiceProxy('analytics-service', config.analyticsServiceUrl));

// 대화 요약 엔드포인트
router.post('/api/queries/summarize', protect, summarizeConversation);

export default router;
