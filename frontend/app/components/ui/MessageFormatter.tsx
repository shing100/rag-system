interface MessageFormatterProps {
    content: string;
}

/**
 * 메시지 내용에 마크다운과 유사한 서식을 적용하는 컴포넌트
 */
export default function MessageFormatter({ content }: MessageFormatterProps) {
    // 간단한 마크다운 서식 처리
    const formatContent = (text: string) => {
        // 코드 블록 처리 (``` ... ```)
        let formattedText = text.replace(
            /```([\s\S]*?)```/g,
            '<pre class="bg-gray-100 dark:bg-gray-800 p-2 my-2 rounded-md overflow-x-auto"><code>$1</code></pre>'
        );

        // 인라인 코드 처리 (` ... `)
        formattedText = formattedText.replace(
            /`([^`]+)`/g,
            '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">$1</code>'
        );

        // 굵은 텍스트 처리 (** ... **)
        formattedText = formattedText.replace(
            /\*\*([^*]+)\*\*/g,
            '<strong>$1</strong>'
        );

        // 기울임 텍스트 처리 (* ... *)
        formattedText = formattedText.replace(
            /\*([^*]+)\*/g,
            '<em>$1</em>'
        );

        // 제목 처리 (# ... ## ... ### ...)
        formattedText = formattedText.replace(
            /^### (.*?)$/gm,
            '<h3 class="text-lg font-bold my-2">$1</h3>'
        );
        formattedText = formattedText.replace(
            /^## (.*?)$/gm,
            '<h2 class="text-xl font-bold my-2">$1</h2>'
        );
        formattedText = formattedText.replace(
            /^# (.*?)$/gm,
            '<h1 class="text-2xl font-bold my-3">$1</h1>'
        );

        // 목록 항목 처리 (- ... 또는 * ... 또는 1. ...)
        formattedText = formattedText.replace(
            /^([-*]) (.*?)$/gm,
            '<li class="ml-4">$2</li>'
        );
        formattedText = formattedText.replace(
            /^(\d+)\. (.*?)$/gm,
            '<li class="ml-4">$2</li>'
        );

        // 줄바꿈 처리
        formattedText = formattedText.replace(/\n/g, '<br />');

        return formattedText;
    };

    return (
        <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
    );
} 