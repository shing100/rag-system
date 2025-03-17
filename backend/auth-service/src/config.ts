import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 4001,
  nodeEnv: process.env.NODE_ENV || 'development',
  postgresUri: process.env.POSTGRES_URI || 'postgres://postgres:postgres@postgres:5432/rag_auth',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
