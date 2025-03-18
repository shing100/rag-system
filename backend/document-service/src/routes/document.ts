import { Router } from 'express';
import multer from 'multer';
import * as documentController from '../controllers/documentController';
import * as versionController from '../controllers/versionController';
import { protect } from '../middleware/auth';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 문서 기본 관리 API
router.get('/projects/:projectId/documents', protect, documentController.getDocuments);
router.post('/projects/:projectId/documents', protect, upload.single('file'), documentController.uploadDocument);
router.get('/:documentId', protect, documentController.getDocument);
router.put('/:documentId', protect, documentController.updateDocument);
router.delete('/:documentId', protect, documentController.deleteDocument);
router.post('/:documentId/restore', protect, documentController.restoreDocument);

// 문서 처리 상태 API
router.get('/:documentId/status', protect, documentController.getDocumentStatus);
router.post('/:documentId/process', protect, documentController.processDocument);
router.post('/:documentId/reprocess', protect, documentController.reprocessDocument);
router.post('/projects/:projectId/reindex', protect, documentController.reindexProjectDocuments);

// 문서 내용 API
router.get('/:documentId/content', protect, documentController.getDocumentContent);
router.get('/:documentId/download', protect, documentController.downloadDocument);

// 문서 버전 관리 API
router.get('/:documentId/versions', protect, versionController.getVersions);
router.post('/:documentId/versions', protect, upload.single('file'), versionController.createVersion);
router.get('/:documentId/versions/:versionId', protect, versionController.getVersion);
router.post('/:documentId/revert/:versionId', protect, versionController.revertToVersion);

export default router;
