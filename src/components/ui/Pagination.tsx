import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const visiblePages = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  
  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }
  
  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 min-w-0">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {start > 1 && (
        <>
          <button 
            onClick={() => onPageChange(1)}
            className={`w-7 h-7 flex items-center justify-center rounded text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            1
          </button>
          {start > 2 && <span className="text-slate-400 px-1">...</span>}
        </>
      )}
      
      {visiblePages.map(pageNum => (
        <button 
          key={pageNum} 
          onClick={() => onPageChange(pageNum)}
          className={`w-7 h-7 flex items-center justify-center rounded text-sm ${pageNum === currentPage ? 'bg-brand-blue/10 text-brand-blue font-medium border border-brand-blue/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          {pageNum}
        </button>
      ))}
      
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-slate-400 px-1">...</span>}
          <button 
            onClick={() => onPageChange(totalPages)}
            className={`w-7 h-7 flex items-center justify-center rounded text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
