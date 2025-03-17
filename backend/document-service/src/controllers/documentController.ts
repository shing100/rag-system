import { Request, Response } from 'express';
import * as documentService from '../services/documentService';
import logger from '../utils/logger';

// 프로젝트의 문서 목록 조회
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const documents = await documentService.getDocumentsByProjectId(projectId);
    
    res.json({
      documents,
      count: documents.length,
    });
  } catch (error) {
    logger.error('문서 목록 조회 오류:', error);
    res.status(500).json({ message: '문서 목록을 불러오는 중 오류가 발생했습니다' });
  }
};

// 문서 상세 조회
export const getDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    // 다운로드 URL 생성
    const downloadUrl = await documentService.generateDownloadUrl(document.filePath);
    
    res.json({
      document,
      downloadUrl,
    });
  } catch (error) {
    logger.error('문서 상세 조회 오류:', error);
    res.status(500).json({ message: '문서를 불러오는 중 오류가 발생했습니다' });
  }
};

// 문서 업로드 URL 생성
export const createUploadUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, contentType } = req.body;
    
    if (!fileName || !contentType) {
      return res.status(400).json({ message: '파일 이름과 콘텐츠 타입이 필요합니다' });
    }
    
    const { uploadUrl, key } = await documentService.generateUploadUrl(fileName, contentType);
    
    res.json({
      uploadUrl,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    logger.error('업로드 URL 생성 오류:', error);
    res.status(500).json({ message: '업로드 URL을 생성하는 중 오류가 발생했습니다' });
  }
};

// 문서 메타데이터 생성
export const createDocument = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, filePath, mimeType, fileSize, metadata } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증되지 않은 요청입니다' });
    }
    
    if (!name || !filePath || !mimeType || !fileSize) {
      return res.status(400).json({ message: '필수 정보가 누락되었습니다' });
    }
    
    const document = await documentService.createDocument({
      projectId,
      uploaderId: userId,
      name,
      filePath,
      mimeType,
      fileSize,
      metadata,
    });
    
    // 첫 번째 버전 생성
    await documentService.createDocumentVersion(document.id, {
      filePath,
      fileSize,
      createdBy: userId,
    });
    
    // 문서 처리 요청
    await documentService.requestDocumentProcessing(document.id);
    
    res.status(201).json({
      message: '문서가 성공적으로 업로드되었습니다',
      document,
    });
  } catch (error) {
    logger.error('문서 생성 오류:', error);
    res.status(500).json({ message: '문서를 생성하는 중 오류가 발생했습니다' });
  }
};

// 문서 정보 업데이트
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { name, metadata } = req.body;
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    const updatedDocument = await documentService.updateDocument(documentId, {
      name: name || document.name,
      metadata: metadata || document.metadata,
    });
    
    res.json({
      message: '문서 정보가 업데이트되었습니다',
      document: updatedDocument,
    });
  } catch (error) {
    logger.error('문서 업데이트 오류:', error);
    res.status(500).json({ message: '문서 정보를 업데이트하는 중 오류가 발생했습니다' });
  }
};

// 문서 삭제 (소프트 삭제)
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    await documentService.deleteDocument(documentId);
    
    res.json({
      message: '문서가 삭제되었습니다',
    });
  } catch (error) {
    logger.error('문서 삭제 오류:', error);
    res.status(500).json({ message: '문서를 삭제하는 중 오류가 발생했습니다' });
  }
};

// 삭제된 문서 복구
export const restoreDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    await documentService.restoreDocument(documentId);
    
    res.json({
      message: '문서가 복구되었습니다',
    });
  } catch (error) {
    logger.error('문서 복구 오류:', error);
    res.status(500).json({ message: '문서를 복구하는 중 오류가 발생했습니다' });
  }
};

// 문서 처리 상태 조회
export const getDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    res.json({
      status: document.status,
      processedAt: document.processedAt,
    });
  } catch (error) {
    logger.error('문서 상태 조회 오류:', error);
    res.status(500).json({ message: '문서 상태를 조회하는 중 오류가 발생했습니다' });
  }
};

// 문서 재처리 요청
export const reprocessDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }
    
    await documentService.requestDocumentProcessing(documentId);
    
    res.json({
      message: '문서 재처리가 요청되었습니다',
    });
  } catch (error) {
    logger.error('문서 재처리 오류:', error);
    res.status(500).json({ message: '문서 재처리를 요청하는 중 오류가 발생했습니다' });
  }
};
