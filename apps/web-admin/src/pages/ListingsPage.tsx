import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, StarOff, Eye, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useListings, useListingMutations } from '../hooks/useAdmin';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import type { AdminListing } from '../lib/api';

const STATUS_OPTIONS = [
 { value: '', label: 'All statuses' },
 { value: 'draft', label: 'Draft' },
 { value: 'live', label: 'Live' },
 { value: 'paused', label: 'Paused' },
];

export default function ListingsPage() {
 const [status, setStatus] = useState('');
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(1);
 const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

 const navigate = useNavigate();
 const debouncedQuery = useDebounce(query, 350);
 const { showToast } = useToast();

 const { data: listings, isLoading, error, refetch } = useListings(
 status || undefined,
 undefined,
 debouncedQuery || undefined,
 page
 );
 const { updateStatus, delete: deleteMutation, toggleFeatured } = useListingMutations();

 const isMutating = updateStatus.isPending || deleteMutation.isPending || toggleFeatured.isPending;

 const handleStatusChange = async (id: number, title: string, newStatus: string) => {
 try {
 await updateStatus.mutateAsync({ id, status: newStatus });
 showToast(`Listing "${title}" set to ${newStatus}`, 'success');
 } catch {
 showToast('Failed to update listing status', 'error');
 }
 };

 const handleDelete = async () => {
 if (!deleteTarget) return;
 try {
 await deleteMutation.mutateAsync(deleteTarget.id);
 showToast(`Listing "${deleteTarget.title}" deleted`, 'success');
 setDeleteTarget(null);
 } catch {
 showToast('Failed to delete listing', 'error');
 }
 };

 const handleToggleFeatured = async (e: React.MouseEvent, id: number, title: string, featured: boolean) => {
 e.stopPropagation();
 try {
 await toggleFeatured.mutateAsync(id);
 showToast(`"${title}" ${featured ? 'removed from' : 'marked as'} featured`, 'success');
 } catch {
 showToast('Failed to update featured status', 'error');
 }
 };

 const formatPrice = (value: number | string | undefined) => {
 if (value === undefined || value === null) return '—';
 return `$${Number(value).toFixed(2)}`;
 };

 const formatDuration = (minutes: number) => {
 if (minutes < 60) return `${minutes}m`;
 const h = Math.floor(minutes / 60);
 const m = minutes % 60;
 return m === 0 ? `${h}h` : `${h}h ${m}m`;
 };

 const columns: ColumnDef<AdminListing>[] = [
 {
 accessorKey: 'title',
 header: 'Listing',
 cell: ({ row }) => {
 const listing = row.original;
 return (
 <div>
 <p className="font-medium text-text-primary">{listing.title}</p>
 <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
 <span>{listing.category?.name}</span>
 <span>•</span>
 <span>{listing.city?.name}</span>
 {listing.is_instant_book && <span className="text-text-primary font-medium">Instant Book</span>}
 </div>
 </div>
 );
 },
 },
 {
 accessorKey: 'provider.business_name',
 header: 'Provider',
 cell: ({ row }) => <p className="text-text-primary">{row.original.provider?.business_name ?? '—'}</p>,
 },
 {
 accessorKey: 'status',
 header: 'Status',
 cell: ({ row }) => <StatusBadge status={row.original.status} />,
 },
 {
 accessorKey: 'base_price_usd',
 header: 'Price',
 cell: ({ row }) => <span className="text-text-primary">{formatPrice(row.original.base_price_usd)}</span>,
 },
 {
 accessorKey: 'duration_minutes',
 header: 'Duration',
 cell: ({ row }) => <span className="text-text-secondary">{formatDuration(row.original.duration_minutes)}</span>,
 },
 {
 id: 'actions',
 header: '',
 cell: ({ row }) => {
 const listing = row.original;
 return (
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/listings/${listing.id}`);
 }}
 className="p-2 rounded-md text-text-secondary hover:bg-surface-elevated"
 title="View"
 >
 <Eye className="w-4 h-4" />
 </button>
 <button
 onClick={(e) => handleToggleFeatured(e, listing.id, listing.title, listing.is_featured)}
 disabled={isMutating}
 className={`p-2 rounded-md ${
 listing.is_featured
 ? 'text-text-primary hover:bg-surface-elevated'
 : 'text-text-secondary hover:bg-surface-elevated'
 }`}
 title={listing.is_featured ? 'Unfeature' : 'Feature'}
 >
 {listing.is_featured ? <Star className="w-4 h-4 fill-text-primary" /> : <StarOff className="w-4 h-4" />}
 </button>
 <select
 value={listing.status}
 onClick={(e) => e.stopPropagation()}
 onChange={(e) => handleStatusChange(listing.id, listing.title, e.target.value)}
 disabled={isMutating}
 className="px-2 py-1.5 rounded-md border border-border text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none disabled:opacity-50"
 >
 {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 <a
 href={`/tours/${listing.slug}`}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(e) => e.stopPropagation()}
 className="p-2 rounded-md text-text-secondary hover:bg-surface-elevated"
 title="Preview"
 >
 <Eye className="w-4 h-4" />
 </a>
 <button
 onClick={(e) => {
 e.stopPropagation();
 setDeleteTarget({ id: listing.id, title: listing.title });
 }}
 disabled={isMutating}
 className="p-2 rounded-md text-error hover:bg-error/10 disabled:opacity-50"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 );
 },
 },
 ];

 const emptyAction = query || status
 ? { label: 'Clear filters', onClick: () => { setQuery(''); setStatus(''); setPage(1); } }
 : undefined;

 return (
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 value={query}
 onChange={(e) => {
 setQuery(e.target.value);
 setPage(1);
 }}
 placeholder="Search listings..."
 className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <select
 value={status}
 onChange={(e) => {
 setStatus(e.target.value);
 setPage(1);
 }}
 className="px-4 py-2.5 rounded-md border border-border bg-surface-raised text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 >
 {STATUS_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 </div>

 <DataTable
 data={listings?.data ?? []}
 columns={columns}
 isLoading={isLoading}
 error={error}
 onRetry={refetch}
 emptyTitle="No listings found"
 emptyMessage={query ? 'Try a different search term or clear the filters.' : 'No listings have been created yet.'}
 emptyAction={emptyAction}
 onRowClick={(listing) => navigate(`/listings/${listing.id}`)}
 getRowId={(listing) => String(listing.id)}
 currentPage={listings?.current_page}
 lastPage={listings?.last_page}
 onPageChange={setPage}
 skeletonColumns={6}
 />

 <ConfirmModal
 isOpen={deleteTarget !== null}
 title="Delete listing"
 message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
 confirmLabel="Delete"
 variant="danger"
 onConfirm={handleDelete}
 onCancel={() => setDeleteTarget(null)}
 />
 </div>
 );
}
