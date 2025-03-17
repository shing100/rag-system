import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 4004,
  nodeEnv: process.env.NODE_ENV || 'development',
  postgresUri: process.env.POSTGRES_URI || 'postgres://postgres:postgres@postgres:5432/rag_documents',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  s3Endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  s3AccessKey: process.env.S3_ACCESS_KEY || 'minio',
  s3SecretKey: process.env.S3_SECRET_KEY || 'minio123',
  s3Bucket: process.env.S3_BUCKET || 'rag-documents',
  ragServiceUrl: process.env.RAG_SERVICE_URL || 'http://rag-service:4005',
};
