import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import {
 useReactTable,
 getCoreRowModel,
 getSortedRowModel,
 flexRender,
 type ColumnDef,
 type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

import Pagination from './Pagination';
import { TableSkeleton } from './Skeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

interface DataTableProps<TData> {
 data: TData[];
 columns: ColumnDef<TData, any>[];
 isLoading?: boolean;
 error?: Error | null;
 onRetry?: () => void;
 emptyTitle?: string;
 emptyMessage?: string;
 emptyAction?: { label: string; onClick: () => void };
 onRowClick?: (row: TData) => void;
 getRowId?: (row: TData) => string;
 currentPage?: number;
 lastPage?: number;
 onPageChange?: (page: number) => void;
 skeletonColumns?: number;
 skeletonRows?: number;
}

export default function DataTable<TData>({
 data,
 columns,
 isLoading,
 error,
 onRetry,
 emptyTitle = 'No data found',
 emptyMessage = 'There is nothing to show right now.',
 emptyAction,
 onRowClick,
 getRowId,
 currentPage = 1,
 lastPage = 1,
 onPageChange,
 skeletonColumns = 6,
 skeletonRows = 5,
}: DataTableProps<TData>) {
 const [sorting, setSorting] = useState<SortingState>([]);

 const table = useReactTable({
 data,
 columns,
 state: { sorting },
 onSortingChange: setSorting,
 getCoreRowModel: getCoreRowModel(),
 getSortedRowModel: getSortedRowModel(),
 getRowId,
 });

 if (isLoading) {
 return <TableSkeleton rows={skeletonRows} columns={skeletonColumns} />;
 }

 if (error) {
 return (
 <ErrorState
 title="Failed to load data"
 message={error?.message || 'Could not fetch data from the server.'}
 onRetry={onRetry}
 />
 );
 }

 if (data.length === 0) {
 return (
 <EmptyState
 title={emptyTitle}
 message={emptyMessage}
 icon="search"
 action={emptyAction}
 />
 );
 }

 return (
 <div className="bg-surface-raised rounded-md border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-surface text-xs uppercase text-text-secondary">
 {table.getHeaderGroups().map((headerGroup) => (
 <tr key={headerGroup.id}>
 {headerGroup.headers.map((header) => {
 const canSort = header.column.getCanSort();
 const sorted = header.column.getIsSorted();
 return (
 <th
 key={header.id}
 className={`px-4 py-3 font-medium whitespace-nowrap ${
 canSort ? 'cursor-pointer select-none hover:text-text-primary' : ''
 }`}
 onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
 >
 <div className="flex items-center gap-1">
 {header.isPlaceholder
 ? null
 : flexRender(header.column.columnDef.header, header.getContext())}
 {canSort && (
 <span className="inline-flex text-text-secondary">
 {sorted === 'asc' ? (
 <ChevronUp className="w-3.5 h-3.5" />
 ) : sorted === 'desc' ? (
 <ChevronDown className="w-3.5 h-3.5" />
 ) : (
 <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
 )}
 </span>
 )}
 </div>
 </th>
 );
 })}
 </tr>
 ))}
 </thead>
 <tbody className="divide-y divide-border">
 {table.getRowModel().rows.map((row) => (
 <tr
 key={row.id}
 className={`hover:bg-surface-elevated transition-colors ${
 onRowClick ? 'cursor-pointer' : ''
 }`}
 onClick={onRowClick ? () => onRowClick(row.original) : undefined}
 >
 {row.getVisibleCells().map((cell) => (
 <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 {onPageChange && lastPage > 1 && (
 <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={onPageChange} />
 )}
 </div>
 );
}
