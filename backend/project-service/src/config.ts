import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 4003,
  nodeEnv: process.env.NODE_ENV || 'development',
  postgresUri: process.env.POSTGRES_URI || 'postgres://postgres:postgres@postgres:5432/rag_projects',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
};
