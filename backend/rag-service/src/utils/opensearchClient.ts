import { Client } from '@opensearch-project/opensearch';
import config from '../config';
import logger from './logger';

const opensearchClient = new Client({
  node: config.openSearchNode,
  auth: {
    username: config.openSearchUsername,
    password: config.openSearchPassword,
  },
  ssl: {
    rejectUnauthorized: false, // 개발 환경에서만 사용
  },
});

// 인덱스 확인 및 생성 함수
export const checkAndCreateIndices = async () => {
  try {
    // 임베딩 벡터 인덱스 확인
    const embeddingIndexExists = await opensearchClient.indices.exists({
      index: 'rag-embeddings',
    });

    if (!embeddingIndexExists.body) {
      logger.info('Creating embeddings index');
      await opensearchClient.indices.create({
        index: 'rag-embeddings',
        body: {
          mappings: {
            properties: {
              chunk_id: { type: 'keyword' },
              document_id: { type: 'keyword' },
              project_id: { type: 'keyword' },
              content: { type: 'text', analyzer: 'standard' },
              metadata: { type: 'object' },
              embedding_vector: {
                type: 'knn_vector',
                dimension: 1536,
                method: {
                  name: 'hnsw',
                  space_type: 'cosinesimil',
                  engine: 'nmslib',
                  parameters: {
                    ef_construction: 512,
                    m: 16,
                  },
                },
              },
            },
          },
        },
      });
      logger.info('Embeddings index created');
    }

    // 쿼리 인덱스 확인
    const queriesIndexExists = await opensearchClient.indices.exists({
      index: 'rag-queries',
    });

    if (!queriesIndexExists.body) {
      logger.info('Creating queries index');
      await opensearchClient.indices.create({
        index: 'rag-queries',
        body: {
          mappings: {
            properties: {
              query_id: { type: 'keyword' },
              project_id: { type: 'keyword' },
              user_id: { type: 'keyword' },
              query_text: { type: 'text', analyzer: 'standard' },
              query_embedding: {
                type: 'knn_vector',
                dimension: 1536,
              },
              created_at: { type: 'date' },
            },
          },
        },
      });
      logger.info('Queries index created');
    }

    logger.info('Index check complete');
  } catch (error) {
    logger.error('Error checking or creating indices', { error });
    throw error;
  }
};

export default opensearchClient;
