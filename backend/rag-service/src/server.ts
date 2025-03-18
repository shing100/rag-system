import app from './app';
import config from './config';
import { initializeDatabase } from './utils/database';
import { checkAndCreateIndices } from './utils/opensearchClient';
import logger from './utils/logger';

const PORT = config.port;

async function startServer() {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    
    // OpenSearch 인덱스 확인 및 생성
    await checkAndCreateIndices();
    
    // 서버 시작
    app.listen(PORT, () => {
      logger.info(`RAG Service 서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (error) {
    logger.error('서버 시작 실패:', { error });
    process.exit(1);
  }
}

startServer();
