import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { Project } from '../models/project';
import { ProjectMember, ProjectRole } from '../models/projectMember';
import { ProjectSettings } from '../models/projectSettings';
import logger from '../utils/logger';

const projectRepository = AppDataSource.getRepository(Project);
const projectMemberRepository = AppDataSource.getRepository(ProjectMember);
const projectSettingsRepository = AppDataSource.getRepository(ProjectSettings);

// 프로젝트 생성
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, category, tags, isPublic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 새 프로젝트 생성
    const project = new Project();
    project.name = name;
    project.description = description;
    project.category = category;
    project.tags = tags;
    project.isPublic = isPublic || false;
    project.ownerId = userId;

    // 프로젝트 저장
    const savedProject = await projectRepository.save(project);

    // 프로젝트 멤버십 생성 (소유자)
    const membership = new ProjectMember();
    membership.projectId = savedProject.id;
    membership.userId = userId;
    membership.role = ProjectRole.OWNER;
    await projectMemberRepository.save(membership);

    // 프로젝트 설정 생성
    const settings = new ProjectSettings();
    settings.projectId = savedProject.id;
    await projectSettingsRepository.save(settings);

    res.status(201).json({
      message: '프로젝트가 성공적으로 생성되었습니다',
      project: savedProject,
    });
  } catch (error) {
    logger.error('프로젝트 생성 오류', { error });
    res.status(500).json({ message: '프로젝트 생성 중 오류가 발생했습니다' });
  }
};

// 프로젝트 목록 조회
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { archived } = req.query;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 사용자의 멤버십을 통해 프로젝트 조회
    const memberships = await projectMemberRepository.find({
      where: { userId },
      relations: ['project'],
    });

    // 프로젝트 필터링 (아카이브 여부에 따라)
    let projects = memberships.map(m => m.project);
    
    if (archived === 'true') {
      projects = projects.filter(p => p.isArchived);
    } else if (archived === 'false' || archived === undefined) {
      projects = projects.filter(p => !p.isArchived);
    }

    res.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    logger.error('프로젝트 목록 조회 오류', { error });
    res.status(500).json({ message: '프로젝트 목록 조회 중 오류가 발생했습니다' });
  }
};

// 프로젝트 상세 조회
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 프로젝트 조회
    const project = await projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다' });
    }

    // 프로젝트 멤버십 확인
    const membership = await projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!membership && !project.isPublic) {
      return res.status(403).json({ message: '프로젝트에 대한 접근 권한이 없습니다' });
    }

    // 프로젝트 멤버 목록 조회
    const members = await projectMemberRepository.find({
      where: { projectId },
    });

    // 프로젝트 설정 조회
    const settings = await projectSettingsRepository.findOne({
      where: { projectId },
    });

    res.json({
      project,
      members,
      settings,
      userRole: membership?.role || (project.isPublic ? ProjectRole.VIEWER : null),
    });
  } catch (error) {
    logger.error('프로젝트 상세 조회 오류', { error });
    res.status(500).json({ message: '프로젝트 상세 조회 중 오류가 발생했습니다' });
  }
};

// 프로젝트 업데이트
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description, category, tags, isPublic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 프로젝트 조회
    const project = await projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다' });
    }

    // 프로젝트 멤버십 확인
    const membership = await projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!membership || (membership.role !== ProjectRole.OWNER && membership.role !== ProjectRole.ADMIN)) {
      return res.status(403).json({ message: '프로젝트 수정 권한이 없습니다' });
    }

    // 프로젝트 정보 업데이트
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (category !== undefined) project.category = category;
    if (tags !== undefined) project.tags = tags;
    if (isPublic !== undefined) project.isPublic = isPublic;

    // 프로젝트 저장
    const updatedProject = await projectRepository.save(project);

    res.json({
      message: '프로젝트가 성공적으로 업데이트되었습니다',
      project: updatedProject,
    });
  } catch (error) {
    logger.error('프로젝트 업데이트 오류', { error });
    res.status(500).json({ message: '프로젝트 업데이트 중 오류가 발생했습니다' });
  }
};

// 프로젝트 삭제
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 프로젝트 조회
    const project = await projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다' });
    }

    // 프로젝트 소유자 확인
    if (project.ownerId !== userId) {
      return res.status(403).json({ message: '프로젝트 삭제 권한이 없습니다' });
    }

    // 프로젝트 삭제
    await projectRepository.remove(project);

    res.json({
      message: '프로젝트가 성공적으로 삭제되었습니다',
    });
  } catch (error) {
    logger.error('프로젝트 삭제 오류', { error });
    res.status(500).json({ message: '프로젝트 삭제 중 오류가 발생했습니다' });
  }
};

// 프로젝트 아카이브/복구
export const toggleArchiveProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { archive } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 프로젝트 조회
    const project = await projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다' });
    }

    // 프로젝트 멤버십 확인
    const membership = await projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!membership || (membership.role !== ProjectRole.OWNER && membership.role !== ProjectRole.ADMIN)) {
      return res.status(403).json({ message: '프로젝트 상태 변경 권한이 없습니다' });
    }

    // 아카이브 상태 업데이트
    project.isArchived = archive === true;

    // 프로젝트 저장
    const updatedProject = await projectRepository.save(project);

    res.json({
      message: `프로젝트가 성공적으로 ${archive ? '아카이브' : '복구'}되었습니다`,
      project: updatedProject,
    });
  } catch (error) {
    logger.error('프로젝트 아카이브/복구 오류', { error });
    res.status(500).json({ message: '프로젝트 상태 변경 중 오류가 발생했습니다' });
  }
};

// 프로젝트 멤버 관리
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 프로젝트 조회
    const project = await projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다' });
    }

    // 현재 사용자의 멤버십 확인
    const currentMembership = await projectMemberRepository.findOne({
      where: { projectId, userId: currentUserId },
    });

    if (!currentMembership || (currentMembership.role !== ProjectRole.OWNER && currentMembership.role !== ProjectRole.ADMIN)) {
      return res.status(403).json({ message: '멤버 추가 권한이 없습니다' });
    }

    // 기존 멤버십 확인
    const existingMembership = await projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (existingMembership) {
      return res.status(400).json({ message: '이미 프로젝트에 추가된 사용자입니다' });
    }

    // 새 멤버십 생성
    const membership = new ProjectMember();
    membership.projectId = projectId;
    membership.userId = userId;
    membership.role = role || ProjectRole.VIEWER;

    // 멤버십 저장
    const savedMembership = await projectMemberRepository.save(membership);

    res.status(201).json({
      message: '프로젝트 멤버가 성공적으로 추가되었습니다',
      membership: savedMembership,
    });
  } catch (error) {
    logger.error('프로젝트 멤버 추가 오류', { error });
    res.status(500).json({ message: '프로젝트 멤버 추가 중 오류가 발생했습니다' });
  }
};

// 프로젝트 멤버 권한 수정
export const updateProjectMember = async (req: Request, res: Response) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 프로젝트 조회
    const project = await projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다' });
    }

    // 현재 사용자의 멤버십 확인
    const currentMembership = await projectMemberRepository.findOne({
      where: { projectId, userId: currentUserId },
    });

    if (!currentMembership || (currentMembership.role !== ProjectRole.OWNER && currentMembership.role !== ProjectRole.ADMIN)) {
      return res.status(403).json({ message: '멤버 권한 수정 권한이 없습니다' });
    }

    // 대상 멤버십 조회
    const targetMembership = await projectMemberRepository.findOne({
      where: { id: memberId, projectId },
    });

    if (!targetMembership) {
      return res.status(404).json({ message: '프로젝트 멤버를 찾을 수 없습니다' });
    }

    // 프로젝트 소유자는 권한 변경 불가
    if (targetMembership.userId === project.ownerId) {
      return res.status(403).json({ message: '프로젝트 소유자의 권한은 변경할 수 없습니다' });
    }

    // 멤버십 권한 수정
    targetMembership.role = role;

    // 멤버십 저장
    const updatedMembership = await projectMemberRepository.save(targetMembership);

    res.json({
      message: '프로젝트 멤버 권한이 성공적으로 수정되었습니다',
      membership: updatedMembership,
    });
  } catch (error) {
    logger.error('프로젝트 멤버 권한 수정 오류', { error });
    res.status(500).json({ message: '프로젝트 멤버 권한 수정 중 오류가 발생했습니다' });
  }
};

// 프로젝트 멤버 제거
export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    const { projectId, memberId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }

    // 프로젝트 조회
    const project = await projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다' });
    }

    // 현재 사용자의 멤버십 확인
    const currentMembership = await projectMemberRepository.findOne({
      where: { projectId, userId: currentUserId },
    });

    if (!currentMembership || (currentMembership.role !== ProjectRole.OWNER && currentMembership.role !== ProjectRole.ADMIN)) {
      return res.status(403).json({ message: '멤버 제거 권한이 없습니다' });
    }

    // 대상 멤버십 조회
    const targetMembership = await projectMemberRepository.findOne({
      where: { id: memberId, projectId },
    });

    if (!targetMembership) {
      return res.status(404).json({ message: '프로젝트 멤버를 찾을 수 없습니다' });
    }

    // 프로젝트 소유자는 제거 불가
    if (targetMembership.userId === project.ownerId) {
      return res.status(403).json({ message: '프로젝트 소유자는 제거할 수 없습니다' });
    }

    // 멤버십 제거
    await projectMemberRepository.remove(targetMembership);

    res.json({
      message: '프로젝트 멤버가 성공적으로 제거되었습니다',
    });
  } catch (error) {
    logger.error('프로젝트 멤버 제거 오류', { error });
    res.status(500).json({ message: '프로젝트 멤버 제거 중 오류가 발생했습니다' });
  }
};
