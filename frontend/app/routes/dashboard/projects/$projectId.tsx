import { useState, useEffect } from 'react';
import { Link, useParams } from '@remix-run/react';
import api from '../../../lib/api';
import ChatInterface from '../../../components/ui/ChatInterface';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isArchived: boolean;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/projects/${projectId}`);
        setProject(response.data.project);
        setError('');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        console.error('프로젝트 조회 오류:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-md text-center mb-4">
          {error || '프로젝트를 찾을 수 없습니다'}
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
                to="/dashboard/projects"
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.isArchived && (
                <span className="ml-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  아카이브됨
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/dashboard/projects/${projectId}/documents`}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
              >
                문서 관리
              </Link>
              <Link
                to={`/dashboard/projects/${projectId}/query`}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                질의하기
              </Link>
            </div>
          </div>

          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 프로젝트 정보 */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {project.name}
                      </h1>
                      <div className="flex space-x-2">
                        <Link
                          to={`/dashboard/projects/${project.id}/documents`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          문서 관리
                        </Link>
                        <Link
                          to={`/dashboard/projects/${project.id}/settings`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          설정
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 text-gray-700 dark:text-gray-300">
                      {project.description}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">카테고리</h3>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{project.category}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">공개 여부</h3>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{project.isPublic ? '공개' : '비공개'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">문서 수</h3>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{project.documentCount}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">태그</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 질의응답 인터페이스 */}
                <div className="lg:col-span-1">
                  <ChatInterface projectId={project.id} className="h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
