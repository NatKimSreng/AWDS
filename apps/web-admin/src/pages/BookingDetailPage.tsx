import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
 Calendar,
 Clock,
 Users,
 CreditCard,
 Mail,
 Phone,
 CheckCircle2,
 Ban,
 ArrowRight,
 Receipt,
 Package,
 History,
 User,
 ExternalLink,
} from 'lucide-react';

import { useBooking, useBookingMutations } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';
import DetailHeader from '../components/DetailHeader';
import InfoCard, { InfoRow, MetricCard } from '../components/InfoCard';
import StatusBadge from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import ConfirmModal from '../components/ConfirmModal';

export default function BookingDetailPage() {
 const { id } = useParams<{ id: string }>();
 const bookingId = Number(id);
 const navigate = useNavigate();
 const { showToast } = useToast();
 const [confirmStatus, setConfirmStatus] = useState<'confirmed' | 'completed' | 'cancelled' | null>(null);
 const [cancelNote, setCancelNote] = useState('');

 const { data: booking, isLoading, error, refetch } = useBooking(bookingId);
 const { updateStatus } = useBookingMutations();

 const formatPrice = (value: number | string | undefined, currency: string) => {
 if (value === undefined || value === null) return '—';
 return `${currency} ${Number(value).toFixed(2)}`;
 };

 const formatDate = (date: string | null) => {
 if (!date) return '—';
 return new Date(date).toLocaleDateString('en-US', {
 weekday: 'short',
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 });
 };

 const formatDateTime = (date: string | null) => {
 if (!date) return '—';
 return new Date(date).toLocaleString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 });
 };

 const handleStatusChange = async () => {
 if (!confirmStatus) return;
 const note = confirmStatus === 'cancelled' ? (cancelNote.trim() || undefined) : undefined;

 try {
 await updateStatus.mutateAsync({ id: bookingId, status: confirmStatus, note });
 showToast(`Booking marked as ${confirmStatus}`, 'success');
 setCancelNote('');
 setConfirmStatus(null);
 } catch {
 showToast('Failed to update booking status', 'error');
 }
 };

 if (isLoading) {
 return (
 <div className="space-y-3">
 <Skeleton className="h-10 w-1/3" />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <Skeleton className="h-80 lg:col-span-2" />
 <Skeleton className="h-80" />
 </div>
 </div>
 );
 }

 if (error || !booking) {
 return (
 <ErrorState
 title="Failed to load booking"
 message={error?.message || 'Could not fetch booking details.'}
 onRetry={refetch}
 />
 );
 }

 const statusActions = [];
 if (booking.status === 'pending') {
 statusActions.push(
 <button
 key="confirm"
 onClick={() => setConfirmStatus('confirmed')}
 disabled={updateStatus.isPending}
 className="px-4 py-2 rounded-md text-sm font-medium bg-success text-accent-inverse hover:bg-success disabled:opacity-50 "
 >
 <CheckCircle2 className="w-4 h-4 inline mr-1" /> Confirm
 </button>
 );
 }
 if (booking.status === 'confirmed') {
 statusActions.push(
 <button
 key="complete"
 onClick={() => setConfirmStatus('completed')}
 disabled={updateStatus.isPending}
 className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-accent-inverse hover:bg-accent disabled:opacity-50 "
 >
 <ArrowRight className="w-4 h-4 inline mr-1" /> Complete
 </button>
 );
 }
 if (booking.status !== 'cancelled' && booking.status !== 'completed') {
 statusActions.push(
 <button
 key="cancel"
 onClick={() => setConfirmStatus('cancelled')}
 disabled={updateStatus.isPending}
 className="px-4 py-2 rounded-md text-sm font-medium bg-error/10 text-error hover:bg-error/20 disabled:opacity-50"
 >
 <Ban className="w-4 h-4 inline mr-1" /> Cancel
 </button>
 );
 }

 return (
 <div className="space-y-3">
 <DetailHeader
 title={`Booking ${booking.booking_ref}`}
 subtitle={booking.activity?.title ?? 'Unknown activity'}
 backTo="/bookings"
 backLabel="Bookings"
 meta={[
 { label: 'Travelers', value: booking.traveler_count, icon: Users },
 { label: 'Total', value: formatPrice(booking.total_price, booking.currency), icon: Receipt },
 ]}
 actions={statusActions.length > 0 ? <>{statusActions}</> : undefined}
 />

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <MetricCard label="Status" value={<StatusBadge status={booking.status} />} icon={CheckCircle2} color="green" />
 <MetricCard label="Travelers" value={booking.traveler_count} icon={Users} color="blue" />
 <MetricCard label="Total" value={formatPrice(booking.total_price, booking.currency)} icon={Receipt} color="orange" />
 <MetricCard label="Commission" value={formatPrice(booking.commission_amount, booking.currency)} icon={CreditCard} color="gray" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <div className="lg:col-span-2 space-y-3">
 <InfoCard title="Booking details" icon={Receipt}>
 <InfoRow
 label="Date & time"
 icon={Calendar}
 value={
 <span className="flex items-center gap-2">
 {formatDate(booking.booking_date)}
 {booking.booking_time && (
 <span className="inline-flex items-center gap-1 text-text-secondary">
 <Clock className="w-3.5 h-3.5" /> {booking.booking_time}
 </span>
 )}
 </span>
 }
 />
 <InfoRow
 label="Payment method"
 icon={CreditCard}
 value={
 <span className="inline-flex items-center gap-1 capitalize">
 {booking.payment_method ?? '—'}
 </span>
 }
 />
 <InfoRow
 label="Special requests"
 value={booking.special_requests || <span className="text-text-secondary italic">No special requests.</span>}
 />
 <InfoRow label="Created" value={formatDateTime(booking.created_at)} icon={Clock} />
 {booking.confirmed_at && <InfoRow label="Confirmed" value={formatDateTime(booking.confirmed_at)} icon={CheckCircle2} />}
 {booking.cancelled_at && <InfoRow label="Cancelled" value={formatDateTime(booking.cancelled_at)} icon={Ban} />}
 </InfoCard>

 <InfoCard title="Activity & provider" icon={Package}>
 <InfoRow
 label="Activity"
 value={
 booking.activity?.title ? (
 <a
 href={`/tours/${booking.activity.slug}`}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1 text-text-primary hover:underline"
 >
 {booking.activity.title} <ExternalLink className="w-3.5 h-3.5" />
 </a>
 ) : null
 }
 />
 <InfoRow
 label="Provider"
 value={
 booking.provider?.business_name ? (
 <button
 onClick={() => navigate(`/providers/${booking.provider?.id}`)}
 className="inline-flex items-center gap-1 text-text-primary hover:underline"
 >
 {booking.provider.business_name}
 </button>
 ) : null
 }
 />
 </InfoCard>

 {booking.addons.length > 0 && (
 <InfoCard title="Addons" icon={Package}>
 <ul className="divide-y divide-border">
 {booking.addons.map((addon) => (
 <li key={addon.id} className="py-2.5 flex items-center justify-between">
 <span className="text-sm text-text-primary">{addon.name}</span>
 <span className="text-sm font-medium text-text-primary">{formatPrice(addon.price, booking.currency)}</span>
 </li>
 ))}
 </ul>
 </InfoCard>
 )}
 </div>

 <div className="space-y-3">
 <InfoCard title="Customer" icon={User}>
 <InfoRow label="Name" value={booking.customer?.name ?? 'Guest'} />
 <InfoRow
 label="Email"
 icon={Mail}
 value={
 booking.customer?.email ? (
 <a
 href={`mailto:${booking.customer.email}`}
 className="flex items-center gap-1 text-text-primary hover:underline"
 >
 {booking.customer.email}
 </a>
 ) : null
 }
 />
 <InfoRow
 label="Phone"
 icon={Phone}
 value={
 booking.customer?.phone ? (
 <span className="flex items-center gap-1">{booking.customer.phone}</span>
 ) : null
 }
 />
 </InfoCard>

 {booking.time_slot && (
 <InfoCard title="Time slot" icon={Clock}>
 <InfoRow label="Date" value={formatDate(booking.time_slot.date)} icon={Calendar} />
 <InfoRow label="Start time" value={booking.time_slot.start_time} icon={Clock} />
 </InfoCard>
 )}

 <InfoCard title="Status history" icon={History}>
 {booking.status_history.length === 0 ? (
 <p className="text-sm text-text-secondary">No status history recorded.</p>
 ) : (
 <ol className="border-l border-border ml-2 space-y-5">
 {booking.status_history.map((history, index) => (
 <li key={index} className="relative ml-4">
 <span className="absolute -left-[0.875rem] top-1 w-3 h-3 rounded-full bg-accent border-2 border-white" />
 <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
 <StatusBadge status={history.status} />
 <span className="text-xs text-text-secondary">{formatDateTime(history.created_at)}</span>
 </div>
 {history.changed_by_type && (
 <p className="text-xs text-text-secondary mt-1">By: {history.changed_by_type}</p>
 )}
 {history.note && (
 <p className="text-sm text-text-secondary mt-1 bg-surface rounded-md p-2">{history.note}</p>
 )}
 </li>
 ))}
 </ol>
 )}
 </InfoCard>
 </div>
 </div>

 <ConfirmModal
 isOpen={confirmStatus !== null}
 title={`Mark as ${confirmStatus}`}
 message={`Are you sure you want to change this booking to ${confirmStatus}?`}
 confirmLabel={`Yes, mark as ${confirmStatus}`}
 variant={confirmStatus === 'cancelled' ? 'danger' : 'primary'}
 note={
 confirmStatus === 'cancelled'
 ? {
 label: 'Reason for cancellation (optional)',
 placeholder: 'e.g. Customer request',
 value: cancelNote,
 onChange: setCancelNote,
 }
 : undefined
 }
 onConfirm={handleStatusChange}
 onCancel={() => {
 setCancelNote('');
 setConfirmStatus(null);
 }}
 />
 </div>
 );
}
