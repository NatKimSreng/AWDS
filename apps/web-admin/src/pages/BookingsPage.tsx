import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, Eye } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useBookings, useBookingMutations } from '../hooks/useAdmin';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import type { AdminBooking } from '../lib/api';

const STATUS_OPTIONS = [
 { value: '', label: 'All statuses' },
 { value: 'pending', label: 'Pending' },
 { value: 'confirmed', label: 'Confirmed' },
 { value: 'completed', label: 'Completed' },
 { value: 'cancelled', label: 'Cancelled' },
];

export default function BookingsPage() {
 const [status, setStatus] = useState('');
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(1);
 const [confirmCancel, setConfirmCancel] = useState<{ id: number; ref: string } | null>(null);
 const [cancelNote, setCancelNote] = useState('');

 const navigate = useNavigate();
 const debouncedQuery = useDebounce(query, 350);
 const { showToast } = useToast();

 const { data: bookings, isLoading, error, refetch } = useBookings(status || undefined, debouncedQuery || undefined, page);
 const { updateStatus } = useBookingMutations();

 const isMutating = updateStatus.isPending;

 const handleStatusChange = async (
 id: number,
 newStatus: 'confirmed' | 'completed' | 'cancelled',
 ref: string,
 note?: string
 ) => {
 try {
 await updateStatus.mutateAsync({ id, status: newStatus, note });
 showToast(`Booking ${ref} marked as ${newStatus}`, 'success');
 } catch {
 showToast('Failed to update booking status', 'error');
 }
 };

 const formatPrice = (value: number | string | undefined, currency: string) => {
 if (value === undefined || value === null) return '—';
 return `${currency} ${Number(value).toFixed(2)}`;
 };

 const formatDate = (date: string | null) => {
 if (!date) return '—';
 return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 };

 const columns: ColumnDef<AdminBooking>[] = [
 {
 accessorKey: 'booking_ref',
 header: 'Booking',
 cell: ({ row }) => {
 const booking = row.original;
 return (
 <div>
 <p className="font-medium text-text-primary">{booking.booking_ref}</p>
 <p className="text-xs text-text-secondary mt-1">{booking.activity?.title ?? '—'}</p>
 <p className="text-xs text-text-secondary">{booking.provider?.business_name ?? '—'}</p>
 </div>
 );
 },
 },
 {
 accessorKey: 'customer.name',
 header: 'Customer',
 cell: ({ row }) => {
 const booking = row.original;
 return (
 <div>
 <p className="text-text-primary">{booking.customer?.name ?? 'Guest'}</p>
 <p className="text-xs text-text-secondary">{booking.customer?.email ?? ''}</p>
 </div>
 );
 },
 },
 {
 accessorKey: 'booking_date',
 header: 'Date & Travelers',
 cell: ({ row }) => {
 const booking = row.original;
 return (
 <div>
 <div className="flex items-center gap-2 text-text-primary">
 <Calendar className="w-3.5 h-3.5 text-text-secondary" />
 <span>{formatDate(booking.booking_date)}</span>
 {booking.booking_time && <span className="text-text-secondary">{booking.booking_time}</span>}
 </div>
 <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
 <Users className="w-3.5 h-3.5" />
 {booking.traveler_count} travelers
 </div>
 </div>
 );
 },
 },
 {
 accessorKey: 'total_price',
 header: 'Total',
 cell: ({ row }) => {
 const booking = row.original;
 return (
 <div>
 <p className="text-text-primary">{formatPrice(booking.total_price, booking.currency)}</p>
 <p className="text-xs text-text-secondary">Commission: {formatPrice(booking.commission_amount, booking.currency)}</p>
 </div>
 );
 },
 },
 {
 accessorKey: 'status',
 header: 'Status',
 cell: ({ row }) => <StatusBadge status={row.original.status} />,
 },
 {
 id: 'actions',
 header: '',
 cell: ({ row }) => {
 const booking = row.original;
 return (
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/bookings/${booking.id}`);
 }}
 className="p-2 rounded-md text-text-secondary hover:bg-surface-elevated"
 title="View"
 >
 <Eye className="w-4 h-4" />
 </button>
 {booking.status !== 'cancelled' && booking.status !== 'completed' && (
 <>
 {booking.status === 'pending' && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleStatusChange(booking.id, 'confirmed', booking.booking_ref);
 }}
 disabled={isMutating}
 className="px-3 py-1.5 rounded-md text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50"
 >
 Confirm
 </button>
 )}
 {booking.status === 'confirmed' && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleStatusChange(booking.id, 'completed', booking.booking_ref);
 }}
 disabled={isMutating}
 className="px-3 py-1.5 rounded-md text-xs font-medium bg-accent/10 text-text-primary hover:bg-accent/20 disabled:opacity-50"
 >
 Complete
 </button>
 )}
 <button
 onClick={(e) => {
 e.stopPropagation();
 setConfirmCancel({ id: booking.id, ref: booking.booking_ref });
 }}
 disabled={isMutating}
 className="px-3 py-1.5 rounded-md text-xs font-medium bg-error/10 text-error hover:bg-error/20 disabled:opacity-50"
 >
 Cancel
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
 placeholder="Search by ref, activity, or customer..."
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
 data={bookings?.data ?? []}
 columns={columns}
 isLoading={isLoading}
 error={error}
 onRetry={refetch}
 emptyTitle="No bookings found"
 emptyMessage={query ? 'Try a different search term or clear the filters.' : 'No bookings have been made yet.'}
 emptyAction={emptyAction}
 onRowClick={(booking) => navigate(`/bookings/${booking.id}`)}
 getRowId={(booking) => String(booking.id)}
 currentPage={bookings?.current_page}
 lastPage={bookings?.last_page}
 onPageChange={setPage}
 skeletonColumns={6}
 />

 <ConfirmModal
 isOpen={confirmCancel !== null}
 title="Cancel booking"
 message={`Are you sure you want to cancel booking ${confirmCancel?.ref}? A refund record will be created if applicable.`}
 confirmLabel="Cancel booking"
 variant="danger"
 note={
 confirmCancel
 ? {
 label: 'Reason for cancellation (optional)',
 placeholder: 'e.g. Customer request',
 value: cancelNote,
 onChange: setCancelNote,
 }
 : undefined
 }
 onConfirm={() => {
 if (!confirmCancel) return;
 const note = cancelNote.trim() || undefined;
 handleStatusChange(confirmCancel.id, 'cancelled', confirmCancel.ref, note);
 setCancelNote('');
 setConfirmCancel(null);
 }}
 onCancel={() => {
 setCancelNote('');
 setConfirmCancel(null);
 }}
 />
 </div>
 );
}
