import { Request, Response } from 'express';
import { generateEmbedding } from '../services/embeddingService';
import opensearchClient from '../utils/opensearchClient';
import logger from '../utils/logger';

// 벡터 검색
export const vectorSearch = async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      query, 
      limit = 5, 
      threshold = 0.7,
      filters = {}
    } = req.body;

    if (!query) {
      return res.status(400).json({ message: '검색어는 필수입니다.' });
    }

    if (!projectId) {
      return res.status(400).json({ message: '프로젝트 ID는 필수입니다.' });
    }

    // 쿼리 임베딩 생성
    const queryEmbedding = await generateEmbedding(query);

    // OpenSearch KNN 쿼리 생성
    const searchBody = {
      knn: {
        embedding_vector: {
          vector: queryEmbedding,
          k: limit * 2
        }
      },
      query: {
        bool: {
          must: [
            { term: { project_id: projectId } }
          ],
          filter: []
        }
      },
      size: limit
    };

    // 필터 추가
    if (filters.documentIds && filters.documentIds.length > 0) {
      searchBody.query.bool.filter.push({
        terms: { document_id: filters.documentIds }
      });
    }

    // 검색 실행
    const { body } = await opensearchClient.search({
      index: 'rag-embeddings',
      body: searchBody
    });

    // 결과 형식화
    const results = body.hits.hits.map((hit: any) => ({
      id: hit._source.chunk_id,
      documentId: hit._source.document_id,
      projectId: hit._source.project_id,
      content: hit._source.content,
      metadata: hit._source.metadata,
      score: hit._score
    })).filter((hit: any) => hit.score >= threshold);

    res.status(200).json({
      query,
      results,
      total: results.length
    });
  } catch (error) {
    logger.error('벡터 검색 중 오류', { error });
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
  }
};

// 키워드 검색
export const keywordSearch = async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      query, 
      limit = 5,
      filters = {}
    } = req.body;

    if (!query) {
      return res.status(400).json({ message: '검색어는 필수입니다.' });
    }

    if (!projectId) {
      return res.status(400).json({ message: '프로젝트 ID는 필수입니다.' });
    }

    // OpenSearch 키워드 쿼리 생성
    const searchBody = {
      query: {
        bool: {
          must: [
            { 
              match: { 
                content: {
                  query: query,
                  operator: 'AND'
                }
              }
            },
            { term: { project_id: projectId } }
          ],
          filter: []
        }
      },
      size: limit
    };

    // 필터 추가
    if (filters.documentIds && filters.documentIds.length > 0) {
      searchBody.query.bool.filter.push({
        terms: { document_id: filters.documentIds }
      });
    }

    // 검색 실행
    const { body } = await opensearchClient.search({
      index: 'rag-embeddings',
      body: searchBody
    });

    // 결과 형식화
    const results = body.hits.hits.map((hit: any) => ({
      id: hit._source.chunk_id,
      documentId: hit._source.document_id,
      projectId: hit._source.project_id,
      content: hit._source.content,
      metadata: hit._source.metadata,
      score: hit._score
    }));

    res.status(200).json({
      query,
      results,
      total: results.length
    });
  } catch (error) {
    logger.error('키워드 검색 중 오류', { error });
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
  }
};

// 하이브리드 검색 (벡터 + 키워드)
export const hybridSearch = async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      query, 
      limit = 5, 
      threshold = 0.7,
      filters = {}
    } = req.body;

    if (!query) {
      return res.status(400).json({ message: '검색어는 필수입니다.' });
    }

    if (!projectId) {
      return res.status(400).json({ message: '프로젝트 ID는 필수입니다.' });
    }

    // 쿼리 임베딩 생성
    const queryEmbedding = await generateEmbedding(query);

    // OpenSearch 하이브리드 쿼리 생성
    const searchBody = {
      knn: {
        embedding_vector: {
          vector: queryEmbedding,
          k: limit * 2
        }
      },
      query: {
        bool: {
          should: [
            { 
              match: { 
                content: {
                  query: query,
                  operator: 'AND',
                  boost: 1.0
                }
              }
            }
          ],
          must: [
            { term: { project_id: projectId } }
          ],
          filter: []
        }
      },
      size: limit
    };

    // 필터 추가
    if (filters.documentIds && filters.documentIds.length > 0) {
      searchBody.query.bool.filter.push({
        terms: { document_id: filters.documentIds }
      });
    }

    // 검색 실행
    const { body } = await opensearchClient.search({
      index: 'rag-embeddings',
      body: searchBody
    });

    // 결과 형식화
    const results = body.hits.hits.map((hit: any) => ({
      id: hit._source.chunk_id,
      documentId: hit._source.document_id,
      projectId: hit._source.project_id,
      content: hit._source.content,
      metadata: hit._source.metadata,
      score: hit._score
    })).filter((hit: any) => hit.score >= threshold);

    res.status(200).json({
      query,
      results,
      total: results.length
    });
  } catch (error) {
    logger.error('하이브리드 검색 중 오류', { error });
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
  }
};

// 유사 질문 검색
export const similarQueries = async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      query, 
      limit = 5
    } = req.body;

    if (!query) {
      return res.status(400).json({ message: '검색어는 필수입니다.' });
    }

    if (!projectId) {
      return res.status(400).json({ message: '프로젝트 ID는 필수입니다.' });
    }

    // 쿼리 임베딩 생성
    const queryEmbedding = await generateEmbedding(query);

    // OpenSearch KNN 쿼리 생성
    const searchBody = {
      knn: {
        query_embedding: {
          vector: queryEmbedding,
          k: limit
        }
      },
      query: {
        bool: {
          must: [
            { term: { project_id: projectId } }
          ]
        }
      },
      size: limit
    };

    // 검색 실행
    const { body } = await opensearchClient.search({
      index: 'rag-queries',
      body: searchBody
    });

    // 결과 형식화
    const results = body.hits.hits.map((hit: any) => ({
      id: hit._source.query_id,
      query: hit._source.query_text,
      score: hit._score,
      createdAt: hit._source.created_at
    }));

    res.status(200).json({
      query,
      results,
      total: results.length
    });
  } catch (error) {
    logger.error('유사 질문 검색 중 오류', { error });
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
  }
};
