import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from '@remix-run/react';
import { useAuthStore } from '~/store/auth';
import api from '~/lib/api';
import DocumentCard, { DocumentStatus } from '~/components/document/DocumentCard';

interface Document {
  id: string;
  name: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
}

interface Project {
  id: string;
  name: string;
}

export default function DocumentsIndex() {
  const { projectId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [project, setProject] = useState<Project | null>(null);
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
        
        // 프로젝트 정보 조회
        const projectResponse = await api.get(`/api/projects/${projectId}`);
        setProject(projectResponse.data.project);
        
        // 문서 목록 조회
        const documentsResponse = await api.get(`/api/projects/${projectId}/documents`);
        setDocuments(documentsResponse.data.documents || []);
        
        setError('');
      } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        console.error('데이터 조회 오류:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && projectId) {
      fetchData();
    }
  }, [isAuthenticated, projectId]);

  if (!isAuthenticated) {
    return null;
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
                to={`/dashboard/projects/${projectId}`}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">
                {project ? `${project.name} - 문서` : '문서'}
              </h1>
            </div>
            <div>
              <Link
                to={`/dashboard/projects/${projectId}/documents/upload`}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                + 문서 업로드
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <DocumentCard 
                  key={document.id} 
                  id={document.id}
                  name={document.name}
                  projectId={projectId || ''}
                  fileSize={document.fileSize}
                  mimeType={document.mimeType}
                  status={document.status}
                  uploadedAt={document.uploadedAt}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="p-5 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                문서 없음
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                이 프로젝트에 아직 문서가 없습니다. 문서를 업로드하여 시작하세요.
              </p>
              <Link
                to={`/dashboard/projects/${projectId}/documents/upload`}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                문서 업로드
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
