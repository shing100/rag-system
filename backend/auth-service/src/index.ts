import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { notFound, errorHandler } from './middleware/error';
import { initializeDatabase } from './utils/database';
import logger from './utils/logger';
import config from './config';

const app = express();

// 미들웨어
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/', routes);

// 오류 처리 미들웨어
app.use(notFound);
app.use(errorHandler);

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    
    // 서버 시작
    app.listen(config.port, () => {
      logger.info(`Auth Service running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('서버 시작 중 오류 발생', { error });
    process.exit(1);
  }
};

startServer();

export default app;
