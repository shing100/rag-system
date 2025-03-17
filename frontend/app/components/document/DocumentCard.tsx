import { Link } from '@remix-run/react';

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface DocumentCardProps {
  id: string;
  name: string;
  projectId: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedAt: string;
}

export default function DocumentCard({
  id,
  name,
  projectId,
  fileSize,
  mimeType,
  status,
  uploadedAt,
}: DocumentCardProps) {
  // 파일 크기 포맷
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // 파일 아이콘 선택
  const getFileIcon = () => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (mimeType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return (
        <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  // 상태 뱃지 스타일 및 텍스트
  const getStatusBadge = () => {
    switch (status) {
      case DocumentStatus.PENDING:
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리 대기중</span>;
      case DocumentStatus.PROCESSING:
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리중</span>;
      case DocumentStatus.COMPLETED:
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리 완료</span>;
      case DocumentStatus.FAILED:
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리 실패</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
              {name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {getStatusBadge()}
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {formatFileSize(fileSize)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              업로드: {new Date(uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-5 py-3">
        <Link
          to={`/dashboard/documents/${id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
        >
          문서 보기
        </Link>
      </div>
    </div>
  );
}
