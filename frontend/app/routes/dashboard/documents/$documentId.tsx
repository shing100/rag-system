import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from '@remix-run/react';
import { useAuthStore } from '~/store/auth';
import api from '~/lib/api';

interface Document {
  id: string;
  name: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
  processedAt: string | null;
  versions: DocumentVersion[];
  metadata: any;
  projectId: string;
}

interface DocumentVersion {
  id: string;
  versionNumber: number;
  filePath: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

export default function DocumentDetail() {
  const { documentId } = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 문서 정보 조회
        const documentResponse = await api.get(`/api/documents/${documentId}`);
        setDocument(documentResponse.data.document);
        setDownloadUrl(documentResponse.data.downloadUrl);
        
        // 프로젝트 정보 조회
        if (documentResponse.data.document?.projectId) {
          const projectResponse = await api.get(`/api/projects/${documentResponse.data.document.projectId}`);
          setProject(projectResponse.data.project);
        }
        
        setError('');
      } catch (err: any) {
        console.error('데이터 조회 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && documentId) {
      fetchData();
    }
  }, [isAuthenticated, documentId]);

  // 파일 크기 포맷
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // 상태 뱃지 스타일 및 텍스트
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리 대기중</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리중</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리 완료</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">처리 실패</span>;
      default:
        return null;
    }
  };

  const handleReprocess = async () => {
    try {
      await api.post(`/api/documents/${documentId}/reprocess`);
      // 상태 업데이트를 위해 문서 정보 다시 조회
      const response = await api.get(`/api/documents/${documentId}`);
      setDocument(response.data.document);
    } catch (err) {
      console.error('문서 재처리 오류:', err);
      setError('문서 재처리 요청 중 오류가 발생했습니다');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 문서를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await api.delete(`/api/documents/${documentId}`);
      navigate(`/dashboard/projects/${document?.projectId}/documents`);
    } catch (err) {
      console.error('문서 삭제 오류:', err);
      setError('문서 삭제 중 오류가 발생했습니다');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-md text-center mb-4">
          {error || '문서를 찾을 수 없습니다'}
        </div>
        <Link
          to="/dashboard/projects"
          className="text-blue-600 hover:underline"
        >
          프로젝트 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold">RAG 시스템</span>
              </div>
              <div className="ml-6 flex space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium hover:border-gray-300 hover:text-gray-700"
                >
                  대시보드
                </Link>
                <Link
                  to="/dashboard/projects"
                  className="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium"
                >
                  프로젝트
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={`/dashboard/projects/${document.projectId}/documents`}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold mr-3">{document.name}</h1>
              {getStatusBadge(document.status)}
            </div>
            <div className="flex space-x-3">
              
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                다운로드
              </a>
              <Link
                to={`/dashboard/projects/${document.projectId}/query?documentId=${documentId}`}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                질의하기
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 문서 정보 */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium mb-4">문서 정보</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">파일 유형</h3>
                      <p className="text-gray-900 dark:text-gray-100">{document.mimeType}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">파일 크기</h3>
                      <p className="text-gray-900 dark:text-gray-100">{formatFileSize(document.fileSize)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">업로드 일시</h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(document.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">처리 상태</h3>
                      <div className="flex items-center">
                        {getStatusBadge(document.status)}
                        {document.status === 'failed' && (
                          <button
                            onClick={handleReprocess}
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            재처리
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {document.processedAt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">처리 완료 시간</h3>
                        <p className="text-gray-900 dark:text-gray-100">
                          {new Date(document.processedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {project && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">프로젝트</h3>
                        <p className="text-gray-900 dark:text-gray-100">
                          {project.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 버전 정보 */}
              {document.versions && document.versions.length > 0 && (
                <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-medium mb-4">버전 기록</h2>
                    
                    <div className="space-y-4">
                      {document.versions.map((version) => (
                        <div key={version.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div>
                            <p className="text-sm font-medium">버전 {version.versionNumber}</p>
                            <p className="text-xs text-gray-500">{new Date(version.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(`/api/documents/${documentId}/versions/${version.id}/download`, '_blank')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              다운로드
                            </button>
                            {version.versionNumber !== 1 && (
                              <button
                                onClick={() => navigate(`/api/documents/${documentId}/revert/${version.id}`)}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                              >
                                되돌리기
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 사이드바 - 관련 문서 및 설정 */}
            <div>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium mb-4">문서 관리</h2>
                  
                  <div className="space-y-4">
                    <Link
                      to={`/dashboard/projects/${document.projectId}/documents/upload?replace=${documentId}`}
                      className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    >
                      새 버전 업로드
                    </Link>
                    <Link
                      to={`/dashboard/documents/${documentId}/edit`}
                      className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    >
                      문서 정보 수정
                    </Link>
                    <button
                      onClick={handleReprocess}
                      className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 w-full text-left"
                    >
                      문서 재처리
                    </button>
                    <button
                      onClick={handleDelete}
                      className="block text-sm text-red-600 hover:text-red-800 w-full text-left"
                    >
                      문서 삭제
                    </button>
                  </div>
                </div>
              </div>

              {document.status === 'completed' && (
                <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-medium mb-4">RAG 기능</h2>
                    
                    <div className="space-y-4">
                      <Link
                        to={`/dashboard/projects/${document.projectId}/query?documentId=${documentId}`}
                        className="block text-blue-600 hover:text-blue-800 font-medium"
                      >
                        이 문서로 질의하기
                      </Link>
                      <p className="text-sm text-gray-500">
                        이 문서의 내용에 대해 질문하고 답변을 받아보세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
