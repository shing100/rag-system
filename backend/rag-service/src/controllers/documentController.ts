import { Request, Response } from 'express';
import { processDocument, reprocessDocument as reprocessDoc } from '../services/indexingService';
import logger from '../utils/logger';
import axios from 'axios';
import opensearchClient from '../utils/opensearchClient';

// 문서 처리 요청
export const processDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { force = false } = req.body;
    
    logger.info(`문서 처리 요청: ${documentId}`);
    
    // 문서 서비스에서 처리 상태 확인
    if (!force) {
      try {
        const statusResponse = await axios.get(`http://document-service:4004/api/documents/${documentId}/status`);
        const status = statusResponse.data.status;
        
        if (status === 'completed') {
          return res.status(200).json({ 
            message: '이미 처리된 문서입니다.',
            documentId,
            status
          });
        }
      } catch (error) {
        logger.error(`문서 상태 확인 중 오류: ${documentId}`, { error });
        // 오류 발생 시 계속 진행
      }
    }
    
    // 문서 처리 상태 업데이트
    try {
      await axios.put(`http://document-service:4004/api/documents/${documentId}/status`, {
        status: 'processing'
      });
    } catch (error) {
      logger.error(`문서 상태 업데이트 중 오류: ${documentId}`, { error });
      // 오류 발생 시 계속 진행
    }
    
    // 비동기 문서 처리 시작
    processDocument(documentId).catch(error => {
      logger.error(`문서 처리 중 오류: ${documentId}`, { error });
      // 오류 발생 시 문서 상태 업데이트
      axios.put(`http://document-service:4004/api/documents/${documentId}/status`, {
        status: 'failed',
        errorMessage: error.message
      }).catch(err => {
        logger.error(`문서 상태 업데이트 중 오류: ${documentId}`, { error: err });
      });
    });
    
    res.status(202).json({
      message: '문서 처리가 시작되었습니다.',
      documentId,
      status: 'processing'
    });
  } catch (error) {
    logger.error('문서 처리 요청 중 오류', { error });
    res.status(500).json({ message: '문서 처리 요청 중 오류가 발생했습니다.' });
  }
};

// 문서 처리 상태 조회
export const getDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    // 문서 서비스에서 처리 상태 조회
    try {
      const statusResponse = await axios.get(`http://document-service:4004/api/documents/${documentId}/status`);
      res.status(200).json(statusResponse.data);
    } catch (error) {
      logger.error(`문서 상태 조회 중 오류: ${documentId}`, { error });
      res.status(500).json({ message: '문서 상태 조회 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    logger.error('문서 상태 조회 요청 중 오류', { error });
    res.status(500).json({ message: '문서 상태 조회 요청 중 오류가 발생했습니다.' });
  }
};

// 문서 재처리 요청
export const reprocessDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    logger.info(`문서 재처리 요청: ${documentId}`);
    
    // 문서 처리 상태 업데이트
    try {
      await axios.put(`http://document-service:4004/api/documents/${documentId}/status`, {
        status: 'processing'
      });
    } catch (error) {
      logger.error(`문서 상태 업데이트 중 오류: ${documentId}`, { error });
      // 오류 발생 시 계속 진행
    }
    
    // 비동기 문서 재처리 시작
    reprocessDoc(documentId).catch(error => {
      logger.error(`문서 재처리 중 오류: ${documentId}`, { error });
      // 오류 발생 시 문서 상태 업데이트
      axios.put(`http://document-service:4004/api/documents/${documentId}/status`, {
        status: 'failed',
        errorMessage: error.message
      }).catch(err => {
        logger.error(`문서 상태 업데이트 중 오류: ${documentId}`, { error: err });
      });
    });
    
    res.status(202).json({
      message: '문서 재처리가 시작되었습니다.',
      documentId,
      status: 'processing'
    });
  } catch (error) {
    logger.error('문서 재처리 요청 중 오류', { error });
    res.status(500).json({ message: '문서 재처리 요청 중 오류가 발생했습니다.' });
  }
};

// 프로젝트 전체 문서 재인덱싱
export const reindexProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    logger.info(`프로젝트 재인덱싱 요청: ${projectId}`);
    
    // 프로젝트 내 모든 문서 조회
    try {
      const documentsResponse = await axios.get(`http://document-service:4004/api/projects/${projectId}/documents`);
      const documents = documentsResponse.data.documents;
      
      if (!documents || documents.length === 0) {
        return res.status(200).json({
          message: '프로젝트에 문서가 없습니다.',
          projectId,
          documentsCount: 0
        });
      }
      
      // 각 문서 재처리 시작
      for (const document of documents) {
        // 문서 처리 상태 업데이트
        await axios.put(`http://document-service:4004/api/documents/${document.id}/status`, {
          status: 'processing'
        });
        
        // 비동기 문서 재처리 시작
        reprocessDoc(document.id).catch(error => {
          logger.error(`문서 재처리 중 오류: ${document.id}`, { error });
          // 오류 발생 시 문서 상태 업데이트
          axios.put(`http://document-service:4004/api/documents/${document.id}/status`, {
            status: 'failed',
            errorMessage: error.message
          }).catch(err => {
            logger.error(`문서 상태 업데이트 중 오류: ${document.id}`, { error: err });
          });
        });
      }
      
      res.status(202).json({
        message: '프로젝트 재인덱싱이 시작되었습니다.',
        projectId,
        documentsCount: documents.length
      });
    } catch (error) {
      logger.error(`프로젝트 문서 조회 중 오류: ${projectId}`, { error });
      res.status(500).json({ message: '프로젝트 문서 조회 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    logger.error('프로젝트 재인덱싱 요청 중 오류', { error });
    res.status(500).json({ message: '프로젝트 재인덱싱 요청 중 오류가 발생했습니다.' });
  }
};

// 문서 청크 조회
export const getDocumentChunks = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    // OpenSearch에서 문서 청크 조회
    const { body } = await opensearchClient.search({
      index: 'rag-embeddings',
      body: {
        query: {
          term: {
            document_id: documentId
          }
        },
        size: Number(limit),
        from: Number(offset),
        sort: [
          { 'metadata.chunkIndex': { order: 'asc' } }
        ]
      }
    });
    
    const chunks = body.hits.hits.map((hit: any) => ({
      id: hit._source.chunk_id,
      documentId: hit._source.document_id,
      content: hit._source.content,
      metadata: hit._source.metadata
    }));
    
    const total = body.hits.total.value;
    
    res.status(200).json({
      documentId,
      chunks,
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('문서 청크 조회 중 오류', { error });
    res.status(500).json({ message: '문서 청크 조회 중 오류가 발생했습니다.' });
  }
};
