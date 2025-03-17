import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import { AppDataSource } from '../utils/database';
import { Document, DocumentStatus } from '../models/document';
import { DocumentVersion } from '../models/documentVersion';
import s3Client from '../utils/s3Client';
import config from '../config';
import logger from '../utils/logger';

const documentRepository = AppDataSource.getRepository(Document);
const documentVersionRepository = AppDataSource.getRepository(DocumentVersion);

export const getDocumentsByProjectId = async (projectId: string) => {
  return documentRepository.find({
    where: { projectId, isDeleted: false },
    order: { uploadedAt: 'DESC' },
  });
};

export const getDocumentById = async (documentId: string) => {
  return documentRepository.findOne({
    where: { id: documentId, isDeleted: false },
    relations: ['versions'],
  });
};

export const createDocument = async (documentData: Partial<Document>) => {
  const document = documentRepository.create(documentData);
  return documentRepository.save(document);
};

export const updateDocument = async (id: string, documentData: Partial<Document>) => {
  await documentRepository.update(id, documentData);
  return getDocumentById(id);
};

export const deleteDocument = async (id: string) => {
  // 소프트 삭제 - isDeleted 플래그만 설정
  await documentRepository.update(id, { isDeleted: true });
  return { success: true };
};

export const restoreDocument = async (id: string) => {
  await documentRepository.update(id, { isDeleted: false });
  return getDocumentById(id);
};

export const createDocumentVersion = async (documentId: string, versionData: Partial<DocumentVersion>) => {
  // 이전 버전 번호 확인
  const latestVersion = await documentVersionRepository.findOne({
    where: { documentId },
    order: { versionNumber: 'DESC' },
  });

  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
  
  const version = documentVersionRepository.create({
    ...versionData,
    documentId,
    versionNumber,
  });

  return documentVersionRepository.save(version);
};

export const getDocumentVersions = async (documentId: string) => {
  return documentVersionRepository.find({
    where: { documentId },
    order: { versionNumber: 'DESC' },
  });
};

export const getDocumentVersion = async (documentId: string, versionId: string) => {
  return documentVersionRepository.findOne({
    where: { id: versionId, documentId },
  });
};

export const generateUploadUrl = async (fileName: string, contentType: string) => {
  const key = `uploads/${Date.now()}-${fileName}`;
  
  const putObjectParams = {
    Bucket: config.s3Bucket,
    Key: key,
    ContentType: contentType,
  };
  
  const command = new PutObjectCommand(putObjectParams);
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return {
    uploadUrl,
    key,
  };
};

export const generateDownloadUrl = async (key: string) => {
  const getObjectParams = {
    Bucket: config.s3Bucket,
    Key: key,
  };
  
  const command = new GetObjectCommand(getObjectParams);
  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return downloadUrl;
};

export const requestDocumentProcessing = async (documentId: string) => {
  try {
    // 문서 상태 업데이트
    await documentRepository.update(documentId, { status: DocumentStatus.PROCESSING });
    
    // RAG 서비스에 처리 요청
    await axios.post(`${config.ragServiceUrl}/process`, { documentId });
    
    return { success: true };
  } catch (error) {
    logger.error(`Error requesting document processing: ${error}`);
    
    // 실패 상태로 업데이트
    await documentRepository.update(documentId, { status: DocumentStatus.FAILED });
    
    throw error;
  }
};

export const markDocumentProcessed = async (documentId: string, success: boolean) => {
  const status = success ? DocumentStatus.COMPLETED : DocumentStatus.FAILED;
  const processedAt = new Date();
  
  await documentRepository.update(documentId, { status, processedAt });
  return getDocumentById(documentId);
};
