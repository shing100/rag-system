import { useState, useEffect } from 'react';
import { Link, useParams } from '@remix-run/react';
import ChatInterface from '../../../../components/ui/ChatInterface';
import api from '../../../../lib/api';

interface Project {
    id: string;
    name: string;
    description: string;
}

export default function QueryProject() {
    const { projectId } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/projects/${projectId}`);
                setProject(response.data.project);
            } catch (err) {
                console.error('프로젝트 정보 조회 오류:', err);
                setError('프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                    {error || '프로젝트를 찾을 수 없습니다.'}
                </div>
                <div className="mt-4">
                    <Link to="/dashboard/projects" className="text-blue-600 hover:underline">
                        프로젝트 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {project.name} - 질의응답
                        </h1>
                        <Link
                            to={`/dashboard/projects/${projectId}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                            프로젝트로 돌아가기
                        </Link>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {project.description}
                    </p>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg p-4 dark:border-gray-700">
                            <ChatInterface projectId={project.id} className="h-[calc(100vh-300px)]" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 