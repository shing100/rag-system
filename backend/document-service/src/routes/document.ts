import { Router } from 'express';
import * as documentController from '../controllers/documentController';
import * as versionController from '../controllers/versionController';
import { protect } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 프로젝트별 문서 관리
router.get('/projects/:projectId/documents', documentController.getDocuments);
router.post('/projects/:projectId/documents', documentController.createDocument);

// 개별 문서 관리
router.get('/documents/:documentId', documentController.getDocument);
router.put('/documents/:documentId', documentController.updateDocument);
router.delete('/documents/:documentId', documentController.deleteDocument);
router.post('/documents/:documentId/restore', documentController.restoreDocument);

// 문서 처리 상태
router.get('/documents/:documentId/status', documentController.getDocumentStatus);
router.post('/documents/:documentId/reprocess', documentController.reprocessDocument);

// 문서 버전 관리
router.get('/documents/:documentId/versions', versionController.getVersions);
router.post('/documents/:documentId/versions', versionController.createVersion);
router.get('/documents/:documentId/versions/:versionId', versionController.getVersion);
router.post('/documents/:documentId/revert/:versionId', versionController.revertToVersion);

// 업로드 URL 생성
router.post('/upload-url', documentController.createUploadUrl);

export default router;
