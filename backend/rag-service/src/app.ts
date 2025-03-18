import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { protect } from './middleware/auth';
import { notFound, errorHandler } from './middleware/error';
import queryRoutes from './routes/queryRoutes';
import documentRoutes from './routes/documentRoutes';
import searchRoutes from './routes/searchRoutes';
import config from './config';
import logger from './utils/logger';

const app = express();

// 미들웨어
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 로깅 미들웨어
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 상태 확인 라우트
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'rag-service' });
});

// API 라우트
app.use('/api/queries', protect, queryRoutes);
app.use('/api/documents', protect, documentRoutes);
app.use('/api/search', protect, searchRoutes);

// 오류 처리 미들웨어
app.use(notFound);
app.use(errorHandler);

export default app;
