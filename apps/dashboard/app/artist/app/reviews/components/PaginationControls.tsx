import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFetching: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isFetching,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null; // Don't show pagination if there's only 1 page

  return (
    <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-4">
      <span className="text-sm text-neutral-500">
        Page <span className="font-medium text-dark">{currentPage}</span> of{" "}
        <span className="font-medium text-dark">{totalPages}</span>
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isFetching}
          className="p-2 rounded -lg border border-neutral-200 text-dark hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isFetching}
          className="p-2 rounded -lg border border-neutral-200 text-dark hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
