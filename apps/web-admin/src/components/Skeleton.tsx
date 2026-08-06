interface SkeletonProps {
 className?: string;
 count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
 return (
 <>
 {Array.from({ length: count }).map((_, i) => (
 <div
 key={i}
 className={`skeleton-shimmer rounded-md ${className}`}
 />
 ))}
 </>
 );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
 return (
 <div className="bg-surface-raised rounded-md border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface">
 <tr>
 {Array.from({ length: columns }).map((_, i) => (
 <th key={i} className="px-4 py-3 text-left">
 <Skeleton className="h-4 w-20" />
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {Array.from({ length: rows }).map((_, rowIndex) => (
 <tr key={rowIndex}>
 {Array.from({ length: columns }).map((_, colIndex) => (
 <td key={colIndex} className="px-4 py-3">
 <Skeleton
 className={`h-4 ${colIndex === 0 ? 'w-32' : 'w-20'}`}
 />
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

export function StatCardSkeleton() {
 return (
 <div className="bg-surface-raised rounded-md p-5 border border-border ">
 <div className="flex items-start justify-between">
 <div className="space-y-2">
 <Skeleton className="h-4 w-24" />
 <Skeleton className="h-8 w-16" />
 </div>
 <Skeleton className="h-10 w-10 rounded-md" />
 </div>
 </div>
 );
}
