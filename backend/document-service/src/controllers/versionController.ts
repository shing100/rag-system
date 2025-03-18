import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Document, DocumentStatus } from '../models/document';
import { DocumentVersion } from '../models/documentVersion';
import { uploadFileToS3, getFileFromS3 } from '../services/s3Service';
import logger from '../utils/logger';

// 문서 버전 목록 조회
export const getVersions = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // 문서 존재 여부 확인
    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 버전 목록 조회
    const versionRepository = getRepository(DocumentVersion);
    const [versions, count] = await versionRepository.findAndCount({
      where: { documentId },
      order: { versionNumber: 'DESC' },
      skip: Number(offset),
      take: Number(limit)
    });

    res.status(200).json({
      versions,
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('문서 버전 목록 조회 중 오류', { error });
    res.status(500).json({ message: '문서 버전 목록을 조회하는 중 오류가 발생했습니다' });
  }
};

// 특정 버전 조회
export const getVersion = async (req: Request, res: Response) => {
  try {
    const { documentId, versionId } = req.params;

    // 버전 정보 조회
    const versionRepository = getRepository(DocumentVersion);
    const version = await versionRepository.findOne({
      where: { id: versionId, documentId }
    });

    if (!version) {
      return res.status(404).json({ message: '문서 버전을 찾을 수 없습니다' });
    }

    // 다운로드 URL 생성
    const downloadUrl = await getSignedUrl(version.filePath);

    res.status(200).json({
      version,
      downloadUrl
    });
  } catch (error) {
    logger.error('문서 버전 조회 중 오류', { error });
    res.status(500).json({ message: '문서 버전을 조회하는 중 오류가 발생했습니다' });
  }
};

// 새 버전 업로드
export const createVersion = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
      return res.status(400).json({ message: '파일이 필요합니다' });
    }

    // 문서 존재 여부 확인
    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 현재 최신 버전 가져오기
    const versionRepository = getRepository(DocumentVersion);
    const latestVersion = await versionRepository
      .createQueryBuilder('version')
      .where('version.documentId = :documentId', { documentId })
      .orderBy('version.versionNumber', 'DESC')
      .getOne();

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // S3에 파일 업로드
    const filePath = `documents/${documentId}/versions/${newVersionNumber}/${file.originalname}`;
    await uploadFileToS3(file.buffer, filePath, file.mimetype);

    // 새 버전 생성
    const newVersion = versionRepository.create({
      documentId,
      versionNumber: newVersionNumber,
      filePath,
      fileSize: file.size,
      createdBy: userId
    });

    await versionRepository.save(newVersion);

    // 문서 상태 업데이트
    document.status = DocumentStatus.PENDING;
    await documentRepository.save(document);

    // RAG 서비스에 처리 요청 
    // (이 부분은 실제 구현에 따라 다를 수 있음)

    res.status(201).json({
      message: '새 버전이 업로드되었습니다',
      version: newVersion
    });
  } catch (error) {
    logger.error('새 버전 업로드 중 오류', { error });
    res.status(500).json({ message: '새 버전 업로드 중 오류가 발생했습니다' });
  }
};

// 특정 문서 버전 복원
export const restoreVersion = async (req: Request, res: Response) => {
  try {
    const { documentId, versionId } = req.params;
    const userId = req.user?.id;

    // 문서 존재 여부 확인
    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 버전 존재 여부 확인
    const versionRepository = getRepository(DocumentVersion);
    const version = await versionRepository.findOne({ 
      where: { id: versionId, documentId } 
    });

    if (!version) {
      return res.status(404).json({ message: '문서 버전을 찾을 수 없습니다' });
    }

    // 현재 최신 버전 가져오기
    const latestVersion = await versionRepository
      .createQueryBuilder('version')
      .where('version.documentId = :documentId', { documentId })
      .orderBy('version.versionNumber', 'DESC')
      .getOne();

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // 복원할 버전의 파일 가져오기
    const fileBuffer = await getFileFromS3(version.filePath);

    // 새 경로에 파일 업로드
    const newFilePath = `documents/${documentId}/versions/${newVersionNumber}/${version.filePath.split('/').pop()}`;
    await uploadFileToS3(fileBuffer, newFilePath, document.mimeType);

    // 새 버전 생성
    const newVersion = versionRepository.create({
      documentId,
      versionNumber: newVersionNumber,
      filePath: newFilePath,
      fileSize: version.fileSize,
      createdBy: userId,
      metadata: {
        restoredFrom: version.versionNumber
      }
    });

    await versionRepository.save(newVersion);

    // 문서 상태 업데이트
    document.status = DocumentStatus.PENDING;
    await documentRepository.save(document);

    // RAG 서비스에 처리 요청
    // (이 부분은 실제 구현에 따라 다를 수 있음)

    res.status(201).json({
      message: '문서 버전이 복원되었습니다',
      version: newVersion
    });
  } catch (error) {
    logger.error('문서 버전 복원 중 오류', { error });
    res.status(500).json({ message: '문서 버전 복원 중 오류가 발생했습니다' });
  }
};

// 특정 버전으로 되돌리기
export const revertToVersion = async (req: Request, res: Response) => {
  try {
    const { documentId, versionId } = req.params;
    const userId = req.user?.id;

    // 문서 존재 여부 확인
    const documentRepository = getRepository(Document);
    const document = await documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: '문서를 찾을 수 없습니다' });
    }

    // 버전 존재 여부 확인
    const versionRepository = getRepository(DocumentVersion);
    const version = await versionRepository.findOne({ 
      where: { id: versionId, documentId } 
    });

    if (!version) {
      return res.status(404).json({ message: '문서 버전을 찾을 수 없습니다' });
    }

    // 이전 버전의 파일을 현재 파일로 설정
    document.filePath = version.filePath;
    document.fileSize = version.fileSize;
    document.status = DocumentStatus.COMPLETED;
    document.updatedAt = new Date();
    
    await documentRepository.save(document);

    res.status(200).json({
      message: '문서가 지정한 버전으로 되돌려졌습니다',
      document
    });
  } catch (error) {
    logger.error('문서 버전 되돌리기 중 오류', { error });
    res.status(500).json({ message: '문서 버전 되돌리기 중 오류가 발생했습니다' });
  }
};

// S3 서명된 URL 생성 헬퍼 함수
async function getSignedUrl(filePath: string): Promise<string> {
  // 실제 구현은 S3 서비스에 따라 다를 수 있음
  // 여기서는 임시 URL 반환
  return `http://minio:9000/${filePath}?signed=true`;
}

// S3에서 파일 가져오기 헬퍼 함수
async function getFileFromS3(filePath: string): Promise<Buffer> {
  // 실제 구현은 S3Service에서 제공되어야 함
  return Buffer.from('dummy file content');
}
