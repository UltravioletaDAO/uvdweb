import React from 'react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ currentPage, totalPages, paginate }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-8">
      <button 
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1 || totalPages === 0}
        className="rounded-md border border-ultraviolet-dark p-2.5 text-center text-sm transition-all shadow-sm hover:shadow-lg text-text-primary hover:text-white hover:bg-ultraviolet-dark hover:border-ultraviolet-dark focus:text-white focus:bg-ultraviolet-dark focus:border-ultraviolet-dark active:border-ultraviolet-dark active:text-white active:bg-ultraviolet-dark disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" 
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
        </svg>
      </button>

      <p className="text-text-secondary">
        {t('pagination.page_of', { current: currentPage, total: totalPages })}
      </p>
      
      <button 
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="rounded-md border border-ultraviolet-dark p-2.5 text-center text-sm transition-all shadow-sm hover:shadow-lg text-text-primary hover:text-white hover:bg-ultraviolet-dark hover:border-ultraviolet-dark focus:text-white focus:bg-ultraviolet-dark focus:border-ultraviolet-dark active:border-ultraviolet-dark active:text-white active:bg-ultraviolet-dark disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" 
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination; 