import { Request, Response } from 'express';
import * as documentService from '../services/documentService';
import logger from '../utils/logger';

// 문서 버전 목록 조회
export const getVersions = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    const versions = await documentService.getDocumentVersions(documentId);
    
    res.json({
      versions,
      count: versions.length,
    });
  } catch (error) {
    logger.error('문서 버전 목록 조회 오류:', error);
    res.status(500).json({ message: '문서 버전 목록을 불러오는 중 오류가 발생했습니다' });
  }
};

// 새 문서 버전 업로드
export const createVersion = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { filePath, fileSize } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    const version = await documentService.createDocumentVersion(documentId, {
      filePath,
      fileSize,
      createdBy: userId,
    });
    
    // 문서 정보 업데이트
    await documentService.updateDocument(documentId, {
      filePath,
      fileSize,
      status: 'pending',
    });
    
    // 문서 재처리 요청
    await documentService.requestDocumentProcessing(documentId);
    
    res.status(201).json({
      message: '새 버전이 성공적으로 업로드되었습니다',
      version,
    });
  } catch (error) {
    logger.error('문서 버전 생성 오류:', error);
    res.status(500).json({ message: '새 문서 버전을 생성하는 중 오류가 발생했습니다' });
  }
};

// 특정 버전 조회
export const getVersion = async (req: Request, res: Response) => {
  try {
    const { documentId, versionId } = req.params;
    
    const version = await documentService.getDocumentVersion(documentId, versionId);
    
    if (!version) {
      return res.status(404).json({ message: '문서 버전을 찾을 수 없습니다' });
    }
    
    // 다운로드 URL 생성
    const downloadUrl = await documentService.generateDownloadUrl(version.filePath);
    
    res.json({
      version,
      downloadUrl,
    });
  } catch (error) {
    logger.error('문서 버전 조회 오류:', error);
    res.status(500).json({ message: '문서 버전을 불러오는 중 오류가 발생했습니다' });
  }
};

// 이전 버전으로 되돌리기
export const revertToVersion = async (req: Request, res: Response) => {
  try {
    const { documentId, versionId } = req.params;
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    const version = await documentService.getDocumentVersion(documentId, versionId);
    
    if (!version) {
      return res.status(404).json({ message: '문서 버전을 찾을 수 없습니다' });
    }
    
    // 문서 정보 업데이트
    await documentService.updateDocument(documentId, {
      filePath: version.filePath,
      fileSize: version.fileSize,
      status: 'pending',
    });
    
    // 문서 재처리 요청
    await documentService.requestDocumentProcessing(documentId);
    
    res.json({
      message: '이전 버전으로 되돌리기가 완료되었습니다',
    });
  } catch (error) {
    logger.error('버전 되돌리기 오류:', error);
    res.status(500).json({ message: '이전 버전으로 되돌리는 중 오류가 발생했습니다' });
  }
};
