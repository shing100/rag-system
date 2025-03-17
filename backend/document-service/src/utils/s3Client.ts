import { S3Client } from '@aws-sdk/client-s3';
import config from '../config';
import logger from './logger';

const s3Client = new S3Client({
  endpoint: config.s3Endpoint,
  region: 'us-east-1', // MinIO에서는 무시됨
  credentials: {
    accessKeyId: config.s3AccessKey,
    secretAccessKey: config.s3SecretKey,
  },
  forcePathStyle: true, // MinIO에서는 필수
});

logger.info('S3 client configured');

export default s3Client;
