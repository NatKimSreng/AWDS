import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
 currentPage: number;
 lastPage: number;
 onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
 if (lastPage <= 1) return null;

 const getPages = () => {
 const pages: (number | string)[] = [];
 const delta = 1;
 const range: number[] = [];

 for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
 range.push(i);
 }

 if (currentPage - delta > 2) {
 pages.push(1, '...');
 } else {
 pages.push(1);
 }

 pages.push(...range);

 if (currentPage + delta < lastPage - 1) {
 pages.push('...', lastPage);
 } else if (lastPage > 1) {
 pages.push(lastPage);
 }

 return pages;
 };

 const pages = getPages();

 return (
 <div className="flex items-center justify-between gap-2 mt-3">
 <button
 onClick={() => onPageChange(currentPage - 1)}
 disabled={currentPage <= 1}
 className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-elevated"
 >
 <ChevronLeft className="w-4 h-4" />
 Previous
 </button>

 <div className="hidden sm:flex items-center gap-1">
 {pages.map((page, index) => {
 if (page === '...') {
 return (
 <span key={`ellipsis-${index}`} className="px-2 text-sm text-text-secondary">
 ...
 </span>
 );
 }

 const isActive = page === currentPage;
 return (
 <button
 key={page}
 onClick={() => onPageChange(page as number)}
 className={`min-w-[2.25rem] h-9 px-2 rounded-md text-sm font-medium transition-colors ${
 isActive
 ? 'bg-accent text-accent-inverse'
 : 'border border-border text-text-primary hover:bg-surface-elevated'
 }`}
 >
 {page}
 </button>
 );
 })}
 </div>

 <span className="sm:hidden text-sm text-text-secondary">
 Page {currentPage} of {lastPage}
 </span>

 <button
 onClick={() => onPageChange(currentPage + 1)}
 disabled={currentPage >= lastPage}
 className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-elevated"
 >
 Next
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 );
}
