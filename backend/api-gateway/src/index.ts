import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import config from './config';

const app = express();

// 미들웨어
// CORS 설정 - 프론트엔드 도메인에서의 요청 허용
const corsOptions = {
  origin: ['http://localhost:3010', 'http://frontend:5173', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

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
app.listen(config.port, () => {
  logger.info(`API Gateway running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;