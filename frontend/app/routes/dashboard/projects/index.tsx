import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { useAuthStore } from '~/store/auth';
import api from '~/lib/api';
import ProjectCard from '~/components/project/ProjectCard';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  documentCount: number;
  isArchived: boolean;
}

export default function ProjectsIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/projects?archived=${showArchived}`);
        setProjects(response.data.projects || []);
        setError('');
      } catch (err: any) {
        console.error('프로젝트 조회 오류:', err);
        setError('프로젝트를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, showArchived]);

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
            <h1 className="text-2xl font-bold">프로젝트</h1>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
              >
                {showArchived ? '아카이브 숨기기' : '아카이브 보기'}
              </button>
              <Link
                to="/dashboard/projects/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                + 새 프로젝트
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
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  category={project.category}
                  documentCount={project.documentCount}
                  isArchived={project.isArchived}
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
                {showArchived ? '아카이브된 프로젝트가 없습니다' : '프로젝트가 없습니다'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {showArchived ? 
                  '아카이브된 프로젝트가 여기에 표시됩니다' : 
                  '새 프로젝트를 만들어 문서를 관리하고 질의응답을 시작하세요'}
              </p>
              {!showArchived && (
                <Link
                  to="/dashboard/projects/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  새 프로젝트 만들기
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
