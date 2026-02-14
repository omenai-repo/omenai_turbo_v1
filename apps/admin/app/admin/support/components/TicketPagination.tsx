interface TicketPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  loading: boolean;
}

export function TicketPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  loading,
}: TicketPaginationProps) {
  return (
    <div className="bg-white px-6 py-4 border border-t-0 border-slate-200 rounded-b-xl flex items-center justify-between">
      <div className="text-sm text-slate-500">
        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
        <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
        <span className="font-medium">{total}</span> results
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || loading}
          className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
