import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 4005,
  nodeEnv: process.env.NODE_ENV || 'development',
  postgresUri: process.env.POSTGRES_URI || 'postgres://postgres:postgres@postgres:5432/rag_queries',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  openSearchNode: process.env.OPENSEARCH_NODE || 'http://opensearch:9200',
  openSearchUsername: process.env.OPENSEARCH_USERNAME || 'admin',
  openSearchPassword: process.env.OPENSEARCH_PASSWORD || 'admin',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  defaultEmbeddingModel: process.env.DEFAULT_EMBEDDING_MODEL || 'openai',
  defaultLlmModel: process.env.DEFAULT_LLM_MODEL || 'openai',
};
