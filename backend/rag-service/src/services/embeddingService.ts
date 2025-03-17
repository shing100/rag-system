import { Configuration, OpenAIApi } from 'openai';
import config from '../config';
import logger from '../utils/logger';

const openaiConfig = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(openaiConfig);

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    logger.debug('Generating embedding for text');
    
    // OpenAI 모델을 사용하여 임베딩 생성
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    const embedding = response.data.data[0].embedding;
    logger.debug(`Embedding generated, dimension: ${embedding.length}`);
    
    return embedding;
  } catch (error) {
    logger.error('Error generating embedding', { error });
    throw new Error('임베딩 생성 중 오류가 발생했습니다');
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    logger.debug(`Generating embeddings for ${texts.length} texts`);
    
    // OpenAI 모델을 사용하여 임베딩 생성
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: texts,
    });
    
    const embeddings = response.data.data.map(item => item.embedding);
    logger.debug(`Embeddings generated, count: ${embeddings.length}`);
    
    return embeddings;
  } catch (error) {
    logger.error('Error generating batch embeddings', { error });
    throw new Error('일괄 임베딩 생성 중 오류가 발생했습니다');
  }
}
