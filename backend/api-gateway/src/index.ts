import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'API Gateway is running' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
