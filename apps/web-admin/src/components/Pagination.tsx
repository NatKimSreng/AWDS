interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 rounded-lg border border-stone-gray/20 text-sm text-stone-charcoal disabled:opacity-50 hover:bg-stone-gray/5"
      >
        Previous
      </button>
      <span className="text-sm text-stone-gray">
        Page {currentPage} of {lastPage}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="px-3 py-1.5 rounded-lg border border-stone-gray/20 text-sm text-stone-charcoal disabled:opacity-50 hover:bg-stone-gray/5"
      >
        Next
      </button>
    </div>
  );
}
