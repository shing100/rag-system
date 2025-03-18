import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from '@remix-run/react';
import { useAuthStore } from '~/store/auth';
import api from '~/lib/api';

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

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/projects/${projectId}`);
        setProject(response.data.project);
        setMembers(response.data.members || []);
        setError('');
      } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        console.error('프로젝트 조회 오류:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && projectId) {
      fetchProjectDetails();
    }
  }, [isAuthenticated, projectId]);

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 프로젝트 정보 */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium mb-4">프로젝트 정보</h2>
                  
                  {project.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">설명</h3>
                      <p className="text-gray-900 dark:text-gray-100">{project.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.category && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">카테고리</h3>
                        <p className="text-gray-900 dark:text-gray-100">{project.category}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">문서 수</h3>
                      <p className="text-gray-900 dark:text-gray-100">{project.documentCount}개</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">생성 일시</h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">마지막 수정</h3>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">태그</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">문서</h2>
                    <Link
                      to={`/dashboard/projects/${projectId}/documents/upload`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      + 문서 업로드
                    </Link>
                  </div>
                  
                  {project.documentCount === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">문서 없음</h3>
                      <p className="mt-1 text-sm text-gray-500">이 프로젝트에 아직 문서가 없습니다.</p>
                      <div className="mt-6">
                        <Link
                          to={`/dashboard/projects/${projectId}/documents/upload`}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          문서 업로드
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Link
                        to={`/dashboard/projects/${projectId}/documents`}
                        className="text-blue-600 hover:underline"
                      >
                        모든 문서 보기
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 사이드바 - 멤버 정보 및 설정 */}
            <div>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">멤버</h2>
                    <button
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      + 멤버 초대
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium">{member.userId.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {member.userId === project.ownerId ? '소유자' : member.userId}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium mb-4">설정</h2>
                  
                  <div className="space-y-4">
                    <Link
                      to={`/dashboard/projects/${projectId}/settings`}
                      className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    >
                      프로젝트 설정
                    </Link>
                    <button
                      className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    >
                      {project.isArchived ? '아카이브 해제' : '아카이브'}
                    </button>
                    <button
                      className="block text-sm text-red-600 hover:text-red-800"
                    >
                      프로젝트 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
