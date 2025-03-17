import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

const openaiConfig = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(openaiConfig);

// OpenAI를 사용한 응답 생성
export async function generateResponseWithOpenAI(
  query: string,
  context: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  try {
    const model = options.model || 'gpt-4';
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;
    
    logger.debug('Generating response with OpenAI', { model, temperature, maxTokens });
    
    const prompt = `
다음 정보를 사용하여 질문에 답변해주세요. 정보에 관련된 내용이 없으면 정보만을 바탕으로 답변하고, 
주어진 정보에 관련 내용이 없다고 솔직하게 말해주세요. 개인적인 의견이나 외부 지식을 추가하지 마세요.

정보:
${context}

질문: ${query}

답변:`;
    
    const response = await openai.createChatCompletion({
      model: model,
      messages: [
        { role: "system", content: "You are a helpful assistant that answers questions based on the provided information." },
        { role: "user", content: prompt }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    
    return response.data.choices[0]?.message?.content?.trim() || '응답을 생성할 수 없습니다.';
  } catch (error) {
    logger.error('Error generating response with OpenAI', { error });
    throw new Error('OpenAI 응답 생성 중 오류가 발생했습니다');
  }
}

// Anthropic Claude를 사용한 응답 생성
export async function generateResponseWithClaude(
  query: string,
  context: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  try {
    const model = options.model || 'claude-2';
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;
    
    logger.debug('Generating response with Claude', { model, temperature, maxTokens });
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model,
        messages: [
          {
            role: "user",
            content: `다음 정보를 사용하여 질문에 답변해주세요. 정보에 관련된 내용이 없으면 정보만을 바탕으로 답변하고, 
주어진 정보에 관련 내용이 없다고 솔직하게 말해주세요. 개인적인 의견이나 외부 지식을 추가하지 마세요.

정보:
${context}

질문: ${query}`
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
      }
    );
    
    return response.data.content[0].text || '응답을 생성할 수 없습니다.';
  } catch (error) {
    logger.error('Error generating response with Claude', { error });
    throw new Error('Claude 응답 생성 중 오류가 발생했습니다');
  }
}

// 적절한 LLM 서비스 선택 및 응답 생성
export async function generateResponse(
  query: string,
  context: string,
  options: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const provider = options.provider || config.defaultLlmModel;
  
  if (provider === 'openai') {
    return generateResponseWithOpenAI(query, context, options);
  } else if (provider === 'anthropic') {
    return generateResponseWithClaude(query, context, options);
  } else {
    throw new Error(`지원하지 않는 LLM 제공 업체: ${provider}`);
  }
}
