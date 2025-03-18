import { Router } from 'express';
import * as queryController from '../controllers/queryController';

const router = Router();

// 질의 제출 및 응답 생성
router.post('/', queryController.submitQuery);

// 프로젝트별 질의 목록 조회
router.get('/projects/:projectId', queryController.getQueriesByProject);

// 특정 질의 조회
router.get('/:queryId', queryController.getQueryById);

// 질의 삭제
router.delete('/:queryId', queryController.deleteQuery);

// 응답 피드백 제출
router.post('/:queryId/responses/:responseId/feedback', queryController.submitFeedback);

export default router;
