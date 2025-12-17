import React from 'react';
import { useAdmin } from '../contexts/AdminContext';

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  pagination,
  onPageChange,
  emptyMessage 
}) => {
  const { t, language } = useAdmin();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx}
                  className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage || t('noData')}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {t('showing')} {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} {t('of')} {pagination.total} {t('results')}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'ar' ? <ChevronRight /> : <ChevronLeft />}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'ar' ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
