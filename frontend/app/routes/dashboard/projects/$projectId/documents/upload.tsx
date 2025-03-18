import { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from '@remix-run/react';
import { useAuthStore } from '~/store/auth';
import api from '~/lib/api';

interface Project {
  id: string;
  name: string;
}

export default function DocumentUpload() {
  const { projectId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const replaceDocumentId = searchParams.get('replace');
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/projects/${projectId}`);
        setProject(response.data.project);
      } catch (err) {
        console.error('프로젝트 조회 오류:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
      }
    };

    if (isAuthenticated && projectId) {
      fetchProject();
    }
  }, [isAuthenticated, projectId]);

  useEffect(() => {
    // 드래그 앤 드롭 이벤트 핸들러
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent) => {
      preventDefault(e);
      dropArea.classList.add('border-blue-500', 'bg-blue-50');
    };

    const handleDragLeave = (e: DragEvent) => {
      preventDefault(e);
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    };

    const handleDrop = (e: DragEvent) => {
      preventDefault(e);
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
      
      if (e.dataTransfer?.files) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
      }
    };

    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragover', preventDefault);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragover', preventDefault);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFiles = (selectedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('업로드할 파일을 선택해주세요');
      return;
    }

    setUploading(true);
    setError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // 1. 업로드 URL 요청
        // 1. 업로드 URL 요청
        try {
          setUploading(true);
          const formData = new FormData();
          formData.append('file', file);
          formData.append('projectId', projectId || '');
          
          if (replaceDocumentId) {
            // 기존 문서에 새 버전 추가
            await api.post(`/api/documents/${replaceDocumentId}/versions`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: percentCompleted,
                }));
              },
            });
          } else {
            // 새 문서 생성
            await api.post(`/api/projects/${projectId}/documents`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: percentCompleted,
                }));
              },
            });
          }
        // 3. 문서 메타데이터 생성 또는 새 버전 생성
        if (replaceDocumentId) {
          // 기존 문서에 새 버전 추가
          await api.post(`/api/documents/${replaceDocumentId}/versions`, {
            filePath: key,
            fileSize: file.size,
          });
        } else {
          // 새 문서 생성
          await api.post(`/api/projects/${projectId}/documents`, {
            name: file.name,
            filePath: key,
            mimeType: file.type,
            fileSize: file.size,
            metadata: {
              originalName: file.name,
              lastModified: file.lastModified,
            },
          });
        }
        
        // 업로드 진행 상태 업데이트
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 100,
        }));
      } catch (err) {
        console.error(`파일 업로드 오류 (${file.name}):`, err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
      }
    }
    
    setUploading(false);
    
    // 모든 파일 업로드 성공 시 이동
    if (!error) {
      if (replaceDocumentId) {
        navigate(`/dashboard/documents/${replaceDocumentId}`);
      } else {
        navigate(`/dashboard/projects/${projectId}/documents`);
      }
    }
  };

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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={replaceDocumentId 
                  ? `/dashboard/documents/${replaceDocumentId}` 
                  : `/dashboard/projects/${projectId}/documents`}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">
                {replaceDocumentId 
                  ? '새 버전 업로드' 
                  : project ? `${project.name} - 문서 업로드` : '문서 업로드'}
              </h1>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              {/* 파일 업로드 영역 */}
              <div 
                ref={dropAreaRef}
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple={!replaceDocumentId}
                  onChange={handleFileInputChange}
                />
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">클릭하여 파일 선택</span> 또는 파일을 여기에 드래그 앤 드롭하세요
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  PDF, DOCX, TXT, CSV, JSON 등 지원
                </p>
              </div>

              {/* 선택된 파일 목록 */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">선택된 파일</h3>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {uploadProgress[file.name] && (
                            <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={uploading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  to={replaceDocumentId 
                    ? `/dashboard/documents/${replaceDocumentId}` 
                    : `/dashboard/projects/${projectId}/documents`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  취소
                </Link>
                <button
                  type="button"
                  onClick={uploadFiles}
                  disabled={uploading || files.length === 0}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                    uploading || files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      업로드 중...
                    </>
                  ) : (
                    '업로드'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
