import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 4010,
  nodeEnv: process.env.NODE_ENV || 'development',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:4001',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://user-service:4002',
  projectServiceUrl: process.env.PROJECT_SERVICE_URL || 'http://project-service:4003',
  documentServiceUrl: process.env.DOCUMENT_SERVICE_URL || 'http://document-service:4004',
  ragServiceUrl: process.env.RAG_SERVICE_URL || 'http://rag-service:4005',
  analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:4006',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
};
