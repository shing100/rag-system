import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
import MessageFormatter from './MessageFormatter';
import { v4 as uuidv4 } from 'uuid';
import {
    ArrowDownTrayIcon,
    DocumentTextIcon,
    TrashIcon,
    UserIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

interface Source {
    id: string;
    title: string;
    snippet: string;
    relevance: number;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    feedback?: 'positive' | 'negative';
    sources?: Source[];
    summarized?: boolean;
}

interface QueryResponse {
    id: string;
    query: string;
    answer: string;
    responseId: string;
    sources: Source[];
    createdAt: string;
}

interface ChatInterfaceProps {
    projectId: string;
    className?: string;
}

// 샘플 질문들
const sampleQuestions = [
    '이 프로젝트에 대해 간략히 설명해주세요.',
    '문서에서 가장 중요한 내용은 무엇인가요?',
    '이 내용에 대한 자세한 예시가 있나요?',
    '핵심 개념을 요약해주세요.',
];

// 로컬 스토리지 키
const CHAT_STORAGE_KEY = 'rag-chat-history';

export default function ChatInterface({ projectId, className = '' }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // 채팅 내역 로컬 스토리지에서 로드
    useEffect(() => {
        const loadChatHistory = () => {
            const storageKey = `${CHAT_STORAGE_KEY}-${projectId}`;
            const savedMessages = localStorage.getItem(storageKey);

            if (savedMessages) {
                try {
                    const parsedMessages = JSON.parse(savedMessages);
                    // timestamp를 Date 객체로 변환
                    const messagesWithDates = parsedMessages.map((msg: Omit<ChatMessage, 'timestamp'> & { timestamp: string }) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                    setMessages(messagesWithDates);
                } catch (e) {
                    console.error('채팅 내역 로드 중 오류:', e);
                }
            }
        };

        loadChatHistory();
    }, [projectId]);

    // 채팅 내역 저장
    useEffect(() => {
        if (messages.length > 0) {
            const storageKey = `${CHAT_STORAGE_KEY}-${projectId}`;
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, projectId]);

    // 채팅 메시지가 추가될 때마다 맨 아래로 스크롤
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // 대화 기록 초기화 함수
    const handleClearChat = () => {
        if (window.confirm('대화 내역을 모두 삭제하시겠습니까?')) {
            setMessages([]);
            const storageKey = `${CHAT_STORAGE_KEY}-${projectId}`;
            localStorage.removeItem(storageKey);
        }
    };

    // 샘플 질문 사용
    const handleUseSampleQuestion = (question: string) => {
        setInputValue(question);
        if (inputRef.current) {
            inputRef.current.focus();
            // 높이 자동 조절을 위해 이벤트 트리거
            const event = new Event('input', { bubbles: true });
            inputRef.current.dispatchEvent(event);
        }
    };

    // 텍스트 입력 높이 자동 조절
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(150, e.target.scrollHeight) + 'px';
    };

    // 대화 내용을 다운로드하는 함수
    const handleDownloadChat = () => {
        // 파일 이름을 현재 날짜와 시간으로 설정
        const fileName = `chat-${new Date().toISOString().replace(/:/g, '-')}.md`;

        // 대화 내용을 마크다운 형식으로 변환
        let markdownContent = `# RAG 시스템 대화 기록\n\n`;
        markdownContent += `생성 시간: ${new Date().toLocaleString()}\n\n`;

        // 각 메시지를 마크다운으로 변환
        messages.forEach(message => {
            const role = message.role === 'user' ? '사용자' : '어시스턴트';
            markdownContent += `## ${role} (${new Date(message.timestamp).toLocaleString()})\n\n`;
            markdownContent += `${message.content}\n\n`;

            // 출처 정보가 있으면 추가
            if (message.sources && message.sources.length > 0) {
                markdownContent += `### 출처:\n\n`;
                message.sources.forEach(source => {
                    markdownContent += `- ${source.title}\n`;
                    if (source.snippet) {
                        markdownContent += `  > ${source.snippet}\n`;
                    }
                });
                markdownContent += `\n`;
            }

            // 피드백 정보가 있으면 추가
            if (message.feedback) {
                markdownContent += `### 피드백: ${message.feedback === 'positive' ? '👍 유용함' : '👎 유용하지 않음'}\n\n`;
            }
        });

        // 마크다운 내용을 블롭(Blob)으로 변환
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        // 다운로드 링크 생성 및 클릭
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // 메모리 누수 방지를 위해 URL 및 요소 정리
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    // 피드백 제출
    const handleFeedback = async (messageId: string | undefined, feedback: 'positive' | 'negative') => {
        if (!messageId) return;

        // 메시지 상태 업데이트
        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, feedback }
                    : msg
            )
        );

        try {
            // 서버에 피드백 전송
            await api.post(`/api/queries/${messageId}/feedback`, {
                rating: feedback === 'positive' ? 1 : 0,
                comment: ''
            });
            console.log('피드백이 성공적으로 제출되었습니다.');
        } catch (err) {
            console.error('피드백 제출 오류:', err);
            // UI 상태는 이미 업데이트했으므로 사용자에게는 오류를 표시하지 않음
        }
    };

    // 요약 함수 추가
    const summarizeConversation = async (messages: ChatMessage[]) => {
        try {
            setIsLoading(true);
            const response = await api.post<{ summary: string }>('/api/queries/summarize', {
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            });

            // 요약 메시지 생성
            const summaryMessage: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: `**대화 요약:**\n\n${response.data.summary}`,
                timestamp: new Date(),
                summarized: true
            };

            setMessages(prevMessages => [...prevMessages, summaryMessage]);
            setIsLoading(false);
        } catch (error) {
            console.error('대화 요약 실패:', error);
            setError('대화를 요약하는 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
    };

    // 로딩 인디케이터
    const renderLoadingIndicator = () => (
        <div className="flex items-center space-x-2 px-4 py-2 border-t dark:border-gray-700">
            <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-200"></div>
            </div>
            <span className="text-sm text-gray-500">답변 생성 중...</span>
        </div>
    );

    // 내용이 없을 때 표시할 메시지
    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">대화를 시작하세요</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                프로젝트 문서에 대해 질문하면 AI가 답변해드립니다.
            </p>

            <div className="mt-6 space-y-2 w-full max-w-md">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">예시 질문:</p>
                <div className="grid grid-cols-1 gap-2">
                    {sampleQuestions.map((question, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleUseSampleQuestion(question)}
                            className="text-left px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // 피드백 버튼 렌더링
    const renderFeedbackButtons = (message: ChatMessage) => {
        // 이미 피드백이 있는 경우
        if (message.feedback) {
            return (
                <div className="mt-2 text-sm text-gray-500">
                    {message.feedback === 'positive' ? '👍 유용한 답변이라고 평가했습니다.' : '👎 유용하지 않은 답변이라고 평가했습니다.'}
                </div>
            );
        }

        return (
            <div className="mt-2 flex space-x-2">
                <button
                    onClick={() => handleFeedback(message.id, 'positive')}
                    className="text-sm text-gray-500 hover:text-green-500"
                    aria-label="Positive feedback"
                >
                    👍 유용해요
                </button>
                <button
                    onClick={() => handleFeedback(message.id, 'negative')}
                    className="text-sm text-gray-500 hover:text-red-500"
                    aria-label="Negative feedback"
                >
                    👎 유용하지 않아요
                </button>
            </div>
        );
    };

    // 질문 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post<QueryResponse>(`/api/queries`, {
                projectId,
                query: userMessage.content,
                options: {
                    useHybridSearch: true,
                    limit: 5,
                    temperature: 0.7,
                }
            });

            const aiMessage: ChatMessage = {
                id: data.id,
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                sources: data.sources,
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('질의 오류:', err);
            const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
            setError(`질문에 답변하는 중 오류가 발생했습니다: ${errorMessage}`);

            // 에러 메시지 추가
            const errorResponse: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: `죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
            // 입력창에 포커스
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    return (
        <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
            <div className="p-4 bg-blue-50 dark:bg-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">문서 질의응답</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        프로젝트 문서 내용에 대해 질문해보세요
                    </p>
                </div>
                {messages.length > 0 && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleDownloadChat}
                            className="text-gray-500 hover:text-blue-500 p-2 rounded-full"
                            title="대화 내역 다운로드"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={handleClearChat}
                            className="text-gray-500 hover:text-red-500 p-2 rounded-full"
                            title="대화 내역 초기화"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                {messages.length === 0 && renderEmptyState()}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`p-4 ${message.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : message.summarized
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-gray-50 dark:bg-gray-800'
                            } rounded-lg my-2`}
                    >
                        <div className="flex items-start">
                            <div className="mr-2">
                                {message.role === 'user' ? (
                                    <UserIcon className="h-6 w-6 text-blue-500" />
                                ) : message.summarized ? (
                                    <DocumentTextIcon className="h-6 w-6 text-green-500" />
                                ) : (
                                    <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-purple-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <MessageFormatter content={message.content} />

                                {message.sources && message.sources.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="text-sm font-semibold mb-1">출처:</h4>
                                        <div className="text-xs space-y-1">
                                            {message.sources.map((source, idx) => (
                                                <div key={idx} className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                    <p>{source.title}</p>
                                                    <p className="text-gray-500">{source.snippet}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {message.role === 'assistant' && !message.summarized && renderFeedbackButtons(message)}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && renderLoadingIndicator()}

                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4">
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="질문을 입력하세요..."
                        rows={1}
                        className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-2 bottom-2 p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </form>

            <div className="flex justify-between items-center mt-4 mb-2">
                <div>
                    <button
                        onClick={handleDownloadChat}
                        disabled={messages.length === 0}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                        aria-label="Download chat"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => summarizeConversation(messages)}
                        disabled={messages.length < 3 || isLoading}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 mr-2"
                        aria-label="Summarize conversation"
                    >
                        <DocumentTextIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleClearChat()}
                        disabled={messages.length === 0}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                        aria-label="Clear chat"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}