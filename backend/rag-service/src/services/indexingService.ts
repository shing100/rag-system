import { Client } from '@opensearch-project/opensearch';
import axios from 'axios';
import opensearchClient from '../utils/opensearchClient';
import { generateEmbedding, generateBatchEmbeddings } from './embeddingService';
import logger from '../utils/logger';

export interface DocumentChunk {
  id: string;
  documentId: string;
  projectId: string;
  content: string;
  metadata?: any;
}

// 문서 청크 인덱싱
export async function indexDocumentChunks(chunks: DocumentChunk[]): Promise<void> {
  try {
    logger.info(`Indexing ${chunks.length} document chunks`);
    
    // 모든 청크의 내용 추출하여 일괄 임베딩 생성
    const contents = chunks.map(chunk => chunk.content);
    const embeddings = await generateBatchEmbeddings(contents);
    
    // 벌크 작업 준비
    const operations = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      
      // 인덱스 작업 추가
      operations.push({ index: { _index: 'rag-embeddings', _id: chunk.id } });
      operations.push({
        chunk_id: chunk.id,
        document_id: chunk.documentId,
        project_id: chunk.projectId,
        content: chunk.content,
        metadata: chunk.metadata || {},
        embedding_vector: embedding,
      });
    }
    
    // 벌크 인덱싱 실행
    if (operations.length > 0) {
      const response = await opensearchClient.bulk({ body: operations });
      
      if (response.body.errors) {
        logger.error('Bulk indexing had errors', { response: response.body });
        throw new Error('일부 청크 인덱싱 중 오류가 발생했습니다');
      }
      
      logger.info(`Successfully indexed ${chunks.length} document chunks`);
    }
  } catch (error) {
    logger.error('Error indexing document chunks', { error });
    throw error;
  }
}

// 문서 처리 및 청킹
export async function processDocument(documentId: string): Promise<void> {
  try {
    logger.info(`Processing document: ${documentId}`);
    
    // 문서 서비스에서 문서 정보 조회
    const documentResponse = await axios.get(`http://document-service:4004/documents/${documentId}`);
    const document = documentResponse.data.document;
    
    if (!document) {
      throw new Error('문서를 찾을 수 없습니다');
    }
    
    // 문서 다운로드 URL 조회
    const downloadUrl = documentResponse.data.downloadUrl;
    
    // 문서 내용 다운로드
    const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    const fileContent = fileResponse.data;
    
    // 문서 유형에 따라 텍스트 추출 (간단한 예시, 실제로는 더 복잡함)
    let text = '';
    if (document.mimeType === 'text/plain') {
      text = Buffer.from(fileContent).toString('utf-8');
    } else if (document.mimeType === 'application/pdf') {
      // PDF 처리 로직 (실제로는 pdf.js 또는 다른 라이브러리 사용)
      text = '임시 PDF 텍스트'; // 임시 예시
    } else {
      // 기타 문서 유형 처리
      text = '임시 문서 텍스트'; // 임시 예시
    }
    
    // 텍스트 청킹 (간단한 예시, 실제로는 더 지능적인 분할 필요)
    const chunkSize = 1000; // 청크 크기 (문자 수)
    const chunks = [];
    
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunkText = text.substring(i, i + chunkSize);
      
      chunks.push({
        id: `${documentId}-chunk-${i / chunkSize}`,
        documentId: documentId,
        projectId: document.projectId,
        content: chunkText,
        metadata: {
          chunkIndex: i / chunkSize,
          startChar: i,
          endChar: Math.min(i + chunkSize, text.length),
          documentName: document.name,
        },
      });
    }
    
    // 생성된 청크 인덱싱
    await indexDocumentChunks(chunks);
    
    // 문서 처리 완료 상태로 업데이트
    await axios.put(`http://document-service:4004/documents/${documentId}/status`, {
      status: 'completed',
    });
    
    logger.info(`Document processing completed: ${documentId}`);
  } catch (error) {
    logger.error(`Error processing document: ${documentId}`, { error });
    
    // 문서 처리 실패 상태로 업데이트
    try {
      await axios.put(`http://document-service:4004/documents/${documentId}/status`, {
        status: 'failed',
      });
    } catch (updateError) {
      logger.error(`Error updating document status: ${documentId}`, { error: updateError });
    }
    
    throw error;
  }
}
