import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Document, DocumentStatus } from '../models/document';
import { uploadFileToS3, getFileFromS3, getSignedUrl } from '../services/s3Service';
import axios from 'axios';
import logger from '../utils/logger';

// 프로젝트의 문서 목록 조회
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { limit = 20, offset = 0, status, search } = req.query;

    const documentRepository = getRepository(Document);
    
    // 쿼리 빌더 생성
    let queryBuilder = documentRepository.createQueryBuilder('document')
      .where('document.projectId = :projectId', { projectId })
      .andWhere('document.isDeleted = :isDeleted', { isDeleted: false });
    
    // 상태 필터 적용
    if (status) {
      queryBuilder = queryBuilder.andWhere('document.status = :status', { status });
    }
    
    // 검색어 필터 적용
    if (search) {
      queryBuilder = queryBuilder.andWhere('(document.name ILIKE :search OR document.metadata::text ILIKE :search)', 
        { search: `%${search}%` });
    }
    
    // 정렬 및 페이지네이션 적용
    queryBuilder = queryBuilder
      .orderBy('document.uploadedAt', 'DESC')
      .skip(Number(offset))
      .take(Number(limit));
    
    // 쿼리 실행
    const [documents, total] = await queryBuilder.getManyAndCount();

    res.status(200).json({
      documents,
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('문서 목록 조회 중 오류', { error });
    res.status(500).json({ message: '문서 목록을 조회하는 중 오류가 발생했습니다' });
  }
};

// 문서 업로드
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const file = req.file;
    const { name, description, language } = req.body;
    const userId = req.user?.id;

    if (!file) {
      return res.status(400).json({ message: '파일이 필요합니다' });
    }

    if (!name) {
      return res.status(400).json({ message: '문서 이름이 필요합니다' });
    }

    // S3에 파일 업로드
    const filePath = `documents/${projectId}/${Date.now()}-${file.originalname}`;
    await uploadFileToS3(file.buffer, filePath, file.mimetype);

    // 데이터베이스에 문서 정보 저장
    const documentRepository = getRepository(Document);
    const document = documentRepository.create({
      projectId,
      uploaderId: userId,
      name,
      filePath,
      mimeType: file.mimetype,
      fileSize: file.size,
      metadata: {
        description,
        originalName: file.originalname
      },
      status: DocumentStatus.PENDING,
      language: language || 'auto',
      isDeleted: false
    });

    await documentRepository.save(document);

    // RAG 서비스에 처리 요청 (비동기)
    try {
      axios.post(`http://rag-service:4005/api/documents/${document.id}/process`, {}, {
        headers: {
          'x-user-id': userId
        }
      }).catch(err => {
        logger.error(`RAG 서비스 처리 요청 실패: ${document.id}`, { error: err });
      });
    } catch (error) {
      logger.error(`RAG 서비스 처리 요청 실패: ${document.id}`, { error });
      // 처리 요청 실패는 치명적이지 않으므로 계속 진행
    }

    res.status(201).json({
      message: '문서가 성공적으로 업로드되었습니다',
      document
    });
  } catch (error) {
    logger.error('문서 업로드 중 오류', { error });
    res.status(500).json({ message: '문서 업로드 중 오류가 발생했습니다' });
  }
};

// 단일 문서 조회
export const getDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 다운로드 URL 생성
    const downloadUrl = await getSignedUrl(document.filePath);

    res.status(200).json({
      document,
      downloadUrl
    });
  } catch (error) {
    logger.error('문서 조회 중 오류', { error });
    res.status(500).json({ message: '문서 조회 중 오류가 발생했습니다' });
  }
};

// 문서 정보 업데이트
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { name, description, language } = req.body;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 업데이트할 필드
    if (name) document.name = name;
    
    // 메타데이터 업데이트
    document.metadata = {
      ...document.metadata,
      description: description || document.metadata?.description
    };
    
    if (language) document.language = language;

    document.updatedAt = new Date();
    await documentRepository.save(document);

    res.status(200).json({
      message: '문서가 업데이트되었습니다',
      document
    });
  } catch (error) {
    logger.error('문서 업데이트 중 오류', { error });
    res.status(500).json({ message: '문서 업데이트 중 오류가 발생했습니다' });
  }
};

// 문서 삭제 (논리적 삭제)
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 논리적 삭제
    document.isDeleted = true;
    document.updatedAt = new Date();
    await documentRepository.save(document);

    res.status(200).json({
      message: '문서가 삭제되었습니다',
      documentId
    });
  } catch (error) {
    logger.error('문서 삭제 중 오류', { error });
    res.status(500).json({ message: '문서 삭제 중 오류가 발생했습니다' });
  }
};

// 삭제된 문서 복구
export const restoreDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 문서 복구
    document.isDeleted = false;
    document.updatedAt = new Date();
    await documentRepository.save(document);

    res.status(200).json({
      message: '문서가 복구되었습니다',
      document
    });
  } catch (error) {
    logger.error('문서 복구 중 오류', { error });
    res.status(500).json({ message: '문서 복구 중 오류가 발생했습니다' });
  }
};

// 문서 처리 상태 조회
export const getDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    res.status(200).json({
      documentId,
      status: document.status,
      processedAt: document.processedAt,
      errorMessage: document.errorMessage
    });
  } catch (error) {
    logger.error('문서 상태 조회 중 오류', { error });
    res.status(500).json({ message: '문서 상태 조회 중 오류가 발생했습니다' });
  }
};

// 문서 처리 요청
export const processDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.id;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 처리 상태 업데이트
    document.status = DocumentStatus.PROCESSING;
    document.errorMessage = null;
    document.updatedAt = new Date();
    await documentRepository.save(document);

    // RAG 서비스에 처리 요청 (비동기)
    try {
      axios.post(`http://rag-service:4005/api/documents/${document.id}/process`, {}, {
        headers: {
          'x-user-id': userId
        }
      }).catch(err => {
        logger.error(`RAG 서비스 처리 요청 실패: ${document.id}`, { error: err });
      });
    } catch (error) {
      logger.error(`RAG 서비스 처리 요청 실패: ${document.id}`, { error });
      // 처리 요청 실패는 치명적이지 않으므로 계속 진행
    }

    res.status(202).json({
      message: '문서 처리가 요청되었습니다',
      documentId,
      status: DocumentStatus.PROCESSING
    });
  } catch (error) {
    logger.error('문서 처리 요청 중 오류', { error });
    res.status(500).json({ message: '문서 처리 요청 중 오류가 발생했습니다' });
  }
};

// 문서 재처리 요청
export const reprocessDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.id;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 처리 상태 업데이트
    document.status = DocumentStatus.PROCESSING;
    document.errorMessage = null;
    document.updatedAt = new Date();
    await documentRepository.save(document);

    // RAG 서비스에 재처리 요청 (비동기)
    try {
      axios.post(`http://rag-service:4005/api/documents/${document.id}/reprocess`, {}, {
        headers: {
          'x-user-id': userId
        }
      }).catch(err => {
        logger.error(`RAG 서비스 재처리 요청 실패: ${document.id}`, { error: err });
      });
    } catch (error) {
      logger.error(`RAG 서비스 재처리 요청 실패: ${document.id}`, { error });
      // 처리 요청 실패는 치명적이지 않으므로 계속 진행
    }

    res.status(202).json({
      message: '문서 재처리가 요청되었습니다',
      documentId,
      status: DocumentStatus.PROCESSING
    });
  } catch (error) {
    logger.error('문서 재처리 요청 중 오류', { error });
    res.status(500).json({ message: '문서 재처리 요청 중 오류가 발생했습니다' });
  }
};

// 프로젝트 문서 재인덱싱
export const reindexProjectDocuments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    // 프로젝트 내 모든 문서 조회
    const documentRepository = getRepository(Document);
    const documents = await documentRepository.find({
      where: {
        projectId,
        isDeleted: false
      }
    });

    if (documents.length === 0) {
      return res.status(200).json({
        message: '재인덱싱할 문서가 없습니다',
        projectId
      });
    }

    // 모든 문서의 상태 업데이트
    for (const document of documents) {
      document.status = DocumentStatus.PROCESSING;
      document.errorMessage = null;
      document.updatedAt = new Date();
    }

    await documentRepository.save(documents);

    // RAG 서비스에 프로젝트 재인덱싱 요청 (비동기)
    try {
      axios.post(`http://rag-service:4005/api/projects/${projectId}/reindex`, {}, {
        headers: {
          'x-user-id': userId
        }
      }).catch(err => {
        logger.error(`RAG 서비스 프로젝트 재인덱싱 요청 실패: ${projectId}`, { error: err });
      });
    } catch (error) {
      logger.error(`RAG 서비스 프로젝트 재인덱싱 요청 실패: ${projectId}`, { error });
      // 처리 요청 실패는 치명적이지 않으므로 계속 진행
    }

    res.status(202).json({
      message: '프로젝트 문서 재인덱싱이 요청되었습니다',
      projectId,
      documentsCount: documents.length
    });
  } catch (error) {
    logger.error('프로젝트 재인덱싱 요청 중 오류', { error });
    res.status(500).json({ message: '프로젝트 재인덱싱 요청 중 오류가 발생했습니다' });
  }
};

// 문서 내용 조회
export const getDocumentContent = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // S3에서 파일 내용 가져오기
    const fileContent = await getFileFromS3(document.filePath);

    // 파일 유형에 따른 Content-Type 설정
    const contentType = document.mimeType || 'application/octet-stream';

    // 응답 헤더 설정
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.metadata?.originalName || document.name}"`);
    
    // 파일 내용 전송
    res.send(fileContent);
  } catch (error) {
    logger.error('문서 내용 조회 중 오류', { error });
    res.status(500).json({ message: '문서 내용 조회 중 오류가 발생했습니다' });
  }
};

// 문서 다운로드
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // S3에서 파일 내용 가져오기
    const fileContent = await getFileFromS3(document.filePath);

    // 파일 유형에 따른 Content-Type 설정
    const contentType = document.mimeType || 'application/octet-stream';

    // 응답 헤더 설정
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.metadata?.originalName || document.name}"`);
    
    // 파일 내용 전송
    res.send(fileContent);
  } catch (error) {
    logger.error('문서 다운로드 중 오류', { error });
    res.status(500).json({ message: '문서 다운로드 중 오류가 발생했습니다' });
  }
};
