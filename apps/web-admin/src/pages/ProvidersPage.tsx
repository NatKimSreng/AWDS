import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, StarOff, Eye } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useProviders, useProviderMutations } from '../hooks/useAdmin';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import type { AdminProvider } from '../lib/api';

const STATUS_OPTIONS = [
 { value: '', label: 'All statuses' },
 { value: 'pending', label: 'Pending' },
 { value: 'approved', label: 'Approved' },
 { value: 'rejected', label: 'Rejected' },
];

export default function ProvidersPage() {
 const [status, setStatus] = useState('');
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(1);
 const [confirmReject, setConfirmReject] = useState<number | null>(null);

 const navigate = useNavigate();
 const debouncedQuery = useDebounce(query, 350);
 const { showToast } = useToast();

 const { data: providers, isLoading, error, refetch } = useProviders(status || undefined, debouncedQuery || undefined, page);
 const { approve, reject, toggleFeatured } = useProviderMutations();

 const isMutating = approve.isPending || reject.isPending || toggleFeatured.isPending;

 const handleApprove = async (id: number, name: string) => {
 try {
 await approve.mutateAsync(id);
 showToast(`Provider "${name}" approved`, 'success');
 } catch {
 showToast('Failed to approve provider', 'error');
 }
 };

 const handleReject = async (id: number, name: string) => {
 try {
 await reject.mutateAsync({ id });
 showToast(`Provider "${name}" rejected`, 'success');
 setConfirmReject(null);
 } catch {
 showToast('Failed to reject provider', 'error');
 }
 };

 const handleToggleFeatured = async (e: React.MouseEvent, id: number, name: string, featured: boolean) => {
 e.stopPropagation();
 try {
 await toggleFeatured.mutateAsync(id);
 showToast(`"${name}" ${featured ? 'removed from' : 'marked as'} featured`, 'success');
 } catch {
 showToast('Failed to update featured status', 'error');
 }
 };

 const columns: ColumnDef<AdminProvider>[] = [
 {
 accessorKey: 'business_name',
 header: 'Provider',
 cell: ({ row }) => {
 const provider = row.original;
 return (
 <div className="flex items-center gap-3">
 <button
 onClick={(e) => handleToggleFeatured(e, provider.id, provider.business_name, provider.is_featured)}
 disabled={isMutating}
 className={`p-1.5 rounded-md transition-colors ${
 provider.is_featured
 ? 'text-text-primary hover:bg-surface-elevated'
 : 'text-text-secondary hover:bg-surface-elevated'
 }`}
 title={provider.is_featured ? 'Unfeature provider' : 'Feature provider'}
 >
 {provider.is_featured ? <Star className="w-4 h-4 fill-text-primary" /> : <StarOff className="w-4 h-4" />}
 </button>
 <div>
 <p className="font-medium text-text-primary">{provider.business_name}</p>
 <p className="text-xs text-text-secondary">{provider.user?.email}</p>
 </div>
 </div>
 );
 },
 },
 {
 accessorKey: 'verification_status',
 header: 'Status',
 cell: ({ row }) => <StatusBadge status={row.original.verification_status} />,
 },
 {
 accessorKey: 'onboarding_status',
 header: 'Onboarding',
 cell: ({ row }) => <span className="text-xs capitalize text-text-secondary">{row.original.onboarding_status}</span>,
 },
 {
 accessorKey: 'avg_rating',
 header: 'Rating',
 cell: ({ row }) => (
 <span className="flex items-center gap-1 text-text-primary">
 <Star className="w-3.5 h-3.5 fill-text-primary" /> {row.original.avg_rating}
 </span>
 ),
 },
 {
 accessorKey: 'total_bookings',
 header: 'Bookings',
 cell: ({ row }) => <span className="text-text-primary">{row.original.total_bookings}</span>,
 },
 {
 accessorKey: 'commission_rate',
 header: 'Commission',
 cell: ({ row }) => <span className="text-text-secondary">{row.original.commission_rate}%</span>,
 },
 {
 id: 'actions',
 header: '',
 cell: ({ row }) => {
 const provider = row.original;
 return (
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/providers/${provider.id}`);
 }}
 className="p-2 rounded-md text-text-secondary hover:bg-surface-elevated"
 title="View"
 >
 <Eye className="w-4 h-4" />
 </button>
 {provider.verification_status === 'pending' && (
 <>
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleApprove(provider.id, provider.business_name);
 }}
 disabled={isMutating}
 className="px-3 py-1.5 rounded-md text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50"
 >
 Approve
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation();
 setConfirmReject(provider.id);
 }}
 disabled={isMutating}
 className="px-3 py-1.5 rounded-md text-xs font-medium bg-error/10 text-error hover:bg-error/20 disabled:opacity-50"
 >
 Reject
 </button>
 </>
 )}
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
 placeholder="Search providers..."
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
 data={providers?.data ?? []}
 columns={columns}
 isLoading={isLoading}
 error={error}
 onRetry={refetch}
 emptyTitle="No providers found"
 emptyMessage={query ? 'Try a different search term or clear the filters.' : 'No providers have been registered yet.'}
 emptyAction={emptyAction}
 onRowClick={(provider) => navigate(`/providers/${provider.id}`)}
 getRowId={(provider) => String(provider.id)}
 currentPage={providers?.current_page}
 lastPage={providers?.last_page}
 onPageChange={setPage}
 skeletonColumns={7}
 />

 <ConfirmModal
 isOpen={confirmReject !== null}
 title="Reject provider"
 message="Are you sure you want to reject this provider application? This action can be reversed later."
 confirmLabel="Reject"
 variant="danger"
 onConfirm={() => {
 const id = confirmReject;
 if (!id) return;
 const provider = providers?.data.find((p) => p.id === id);
 handleReject(id, provider?.business_name ?? '');
 }}
 onCancel={() => setConfirmReject(null)}
 />
 </div>
 );
}
