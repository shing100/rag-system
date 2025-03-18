import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { Query } from '../models/query';
import { Response as QueryResponse } from '../models/response';
import { generateEmbedding } from '../services/embeddingService';
import { searchRelevantChunks } from '../services/searchService';
import { generateResponse } from '../services/llmService';
import logger from '../utils/logger';

// 질의 제출 및 응답 생성
export const submitQuery = async (req: Request, res: Response) => {
  try {
    const { projectId, query, options = {} } = req.body;
    const userId = req.user!.id;

    if (!query) {
      return res.status(400).json({ message: '질의 내용은 필수입니다.' });
    }

    logger.info('질의 제출', { userId, projectId, query });

    // 1. 쿼리 저장
    const queryRepository = AppDataSource.getRepository(Query);
    const newQuery = queryRepository.create({
      userId,
      projectId,
      query,
      language: options.language || 'ko',
    });
    
    await queryRepository.save(newQuery);
    
    // 2. 쿼리 임베딩 생성
    const queryEmbedding = await generateEmbedding(query);
    
    // 3. 관련 문서 청크 검색
    const relevantChunks = await searchRelevantChunks(projectId, query, queryEmbedding, {
      limit: options.limit || 5,
      threshold: options.threshold || 0.7,
      useHybridSearch: options.useHybridSearch !== false,
    });
    
    if (relevantChunks.length === 0) {
      logger.warn('관련 문서 청크를 찾을 수 없습니다', { query });
      return res.status(404).json({ 
        message: '질문에 관련된 정보를 찾을 수 없습니다. 다른 방식으로 질문해보세요.' 
      });
    }
    
    // 4. 컨텍스트 구성
    const context = relevantChunks.map(chunk => 
      `[출처: ${chunk.metadata?.documentName || '문서'}, 청크: ${chunk.metadata?.chunkIndex || ''}]\n${chunk.content}`
    ).join('\n\n');
    
    // 5. LLM 응답 생성
    const answer = await generateResponse(query, context, {
      provider: options.provider,
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });
    
    // 6. 응답 저장
    const responseRepository = AppDataSource.getRepository(QueryResponse);
    const newResponse = responseRepository.create({
      queryId: newQuery.id,
      response: answer,
      model: options.provider || 'openai',
      modelParams: options,
      tokenCount: answer.length / 4, // 대략적인 계산, 실제로는 토큰 카운터 필요
      sourceChunks: relevantChunks,
    });
    
    await responseRepository.save(newResponse);
    
    // 7. 응답 반환
    res.status(200).json({
      id: newQuery.id,
      query: newQuery.query,
      answer: answer,
      responseId: newResponse.id,
      sources: relevantChunks.map(chunk => ({
        id: chunk.documentId,
        title: chunk.metadata?.documentName || '문서',
        snippet: chunk.content.length > 200 
          ? `${chunk.content.substring(0, 200)}...` 
          : chunk.content,
        relevance: chunk.score,
      })),
      createdAt: newQuery.createdAt,
    });
  } catch (error) {
    logger.error('질의 처리 중 오류', { error });
    res.status(500).json({ message: '질의 처리 중 오류가 발생했습니다.' });
  }
};

// 프로젝트별 질의 목록 조회
export const getQueriesByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const queryRepository = AppDataSource.getRepository(Query);
    const queries = await queryRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      take: Number(limit),
      skip: Number(offset),
      relations: ['responses'],
    });
    
    res.status(200).json(queries);
  } catch (error) {
    logger.error('질의 목록 조회 중 오류', { error });
    res.status(500).json({ message: '질의 목록을 조회하는 중 오류가 발생했습니다.' });
  }
};

// 특정 질의 조회
export const getQueryById = async (req: Request, res: Response) => {
  try {
    const { queryId } = req.params;
    
    const queryRepository = AppDataSource.getRepository(Query);
    const query = await queryRepository.findOne({
      where: { id: queryId },
      relations: ['responses'],
    });
    
    if (!query) {
      return res.status(404).json({ message: '질의를 찾을 수 없습니다.' });
    }
    
    res.status(200).json(query);
  } catch (error) {
    logger.error('질의 조회 중 오류', { error });
    res.status(500).json({ message: '질의를 조회하는 중 오류가 발생했습니다.' });
  }
};

// 질의 삭제
export const deleteQuery = async (req: Request, res: Response) => {
  try {
    const { queryId } = req.params;
    
    const queryRepository = AppDataSource.getRepository(Query);
    const query = await queryRepository.findOne({
      where: { id: queryId },
    });
    
    if (!query) {
      return res.status(404).json({ message: '질의를 찾을 수 없습니다.' });
    }
    
    // 사용자 권한 확인
    if (query.userId !== req.user!.id) {
      return res.status(403).json({ message: '이 질의를 삭제할 권한이 없습니다.' });
    }
    
    // 연관된 응답도 함께 삭제됨 (CASCADE 설정 필요)
    await queryRepository.remove(query);
    
    res.status(200).json({ message: '질의가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    logger.error('질의 삭제 중 오류', { error });
    res.status(500).json({ message: '질의를 삭제하는 중 오류가 발생했습니다.' });
  }
};

// 응답 피드백 제출
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { queryId, responseId } = req.params;
    const { rating, comment } = req.body;
    
    if (rating === undefined) {
      return res.status(400).json({ message: '평가 점수는 필수입니다.' });
    }
    
    const responseRepository = AppDataSource.getRepository(QueryResponse);
    const response = await responseRepository.findOne({
      where: { id: responseId, queryId },
    });
    
    if (!response) {
      return res.status(404).json({ message: '응답을 찾을 수 없습니다.' });
    }
    
    // 피드백 업데이트
    response.feedbackRating = rating;
    await responseRepository.save(response);
    
    res.status(200).json({ message: '피드백이 성공적으로 제출되었습니다.' });
  } catch (error) {
    logger.error('피드백 제출 중 오류', { error });
    res.status(500).json({ message: '피드백을 제출하는 중 오류가 발생했습니다.' });
  }
};
