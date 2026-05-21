import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps): React.ReactElement {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      {totalItems !== undefined && pageSize !== undefined && (
        <p className="text-sm text-gray-500">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}–
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </p>
      )}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[2rem] h-8 rounded-lg text-sm font-medium
                ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
