import { Link } from '@remix-run/react';

export interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  category?: string;
  isArchived?: boolean;
}

export default function ProjectCard({
  id,
  name,
  description,
  documentCount,
  category,
  isArchived,
}: ProjectCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${isArchived ? 'opacity-70' : ''
      }`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            {category && (
              <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                {category}
              </span>
            )}
          </div>
          {isArchived && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              아카이브됨
            </span>
          )}
        </div>

        {description && (
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          문서 {documentCount}개
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-5 py-3 flex justify-between items-center">
        <Link
          to={`/dashboard/projects/${id}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
        >
          프로젝트 열기
        </Link>

        <Link
          to={`/dashboard/projects/${id}/query`}
          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}