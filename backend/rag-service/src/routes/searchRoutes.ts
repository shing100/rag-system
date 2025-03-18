import { Router } from 'express';
import * as searchController from '../controllers/searchController';

const router = Router();

// 벡터 검색
router.post('/vector', searchController.vectorSearch);

// 키워드 검색
router.post('/keyword', searchController.keywordSearch);

// 하이브리드 검색 (벡터 + 키워드)
router.post('/hybrid', searchController.hybridSearch);

// 유사 질문 검색
router.post('/similar-queries', searchController.similarQueries);

export default router;
