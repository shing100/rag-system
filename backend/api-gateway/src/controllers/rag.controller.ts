import { Request, Response } from 'express';

/**
 * 대화 내용을 요약합니다.
 */
export const summarizeConversation = async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: '유효한 메시지 배열이 제공되지 않았습니다.' });
        }

        // 개발 중에는 간단한 요약 반환
        // TODO: 실제 AI 서비스에 요약 요청 구현
        const summary = `이 대화는 ${messages.length}개의 메시지로 구성되어 있으며, ` +
            `사용자의 질문에 대한 답변과 관련 정보를 다루고 있습니다. ` +
            `주요 주제는 문서 검색, 정보 추출 및 지식 기반 응답 생성에 관한 것입니다.`;

        return res.json({
            summary
        });
    } catch (error) {
        console.error('대화 요약 중 오류 발생:', error);
        return res.status(500).json({ error: '대화를 요약하는 중 오류가 발생했습니다.' });
    }
}; 