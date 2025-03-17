import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 프로젝트 기본 관리
router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:projectId', projectController.getProjectById);
router.put('/:projectId', projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

// 프로젝트 아카이브/복구
router.post('/:projectId/archive', projectController.toggleArchiveProject);
router.post('/:projectId/restore', projectController.toggleArchiveProject);

// 프로젝트 멤버 관리
router.post('/:projectId/members', projectController.addProjectMember);
router.put('/:projectId/members/:memberId', projectController.updateProjectMember);
router.delete('/:projectId/members/:memberId', projectController.removeProjectMember);

export default router;
