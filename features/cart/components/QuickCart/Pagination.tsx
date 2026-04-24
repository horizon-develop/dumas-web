import React from 'react';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  isLast: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const Pagination: React.FC<PaginationProps> = React.memo(({
  currentPage,
  totalPages,
  isLast,
  onPreviousPage,
  onNextPage
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="px-3 py-2 border-t bg-gray-50 flex items-center justify-between gap-2 text-sm">
      <button
        onClick={onPreviousPage}
        disabled={currentPage === 0}
        className="h-8 w-8 flex items-center justify-center rounded-full border border-red-300 bg-white text-red-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
        aria-label="Página anterior"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
        <span className="text-gray-600">Página</span>
        <span className="text-[#c8102e]">{currentPage + 1}</span>
        <span className="text-gray-500">/</span>
        <span className="text-gray-700">{totalPages}</span>
      </div>

      <button
        onClick={onNextPage}
        disabled={isLast}
        className="h-8 w-8 flex items-center justify-center rounded-full border border-red-300 bg-white text-red-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
        aria-label="Página siguiente"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
