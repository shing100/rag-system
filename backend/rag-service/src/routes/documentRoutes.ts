import { Router } from 'express';
import * as documentController from '../controllers/documentController';

const router = Router();

// 문서 처리 요청
router.post('/:documentId/process', documentController.processDocument);

// 문서 처리 상태 조회
router.get('/:documentId/status', documentController.getDocumentStatus);

// 문서 재처리 요청
router.post('/:documentId/reprocess', documentController.reprocessDocument);

// 프로젝트 전체 문서 재인덱싱
router.post('/projects/:projectId/reindex', documentController.reindexProject);

// 문서 청크 조회
router.get('/:documentId/chunks', documentController.getDocumentChunks);

export default router;
