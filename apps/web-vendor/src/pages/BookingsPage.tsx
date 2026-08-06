import { useEffect, useState } from 'react';
import { Eye, Loader2, Search } from 'lucide-react';

import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getBooking, getBookings, updateBookingStatus, type VendorBooking } from '../lib/api';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function BookingsPage() {
 const [bookings, setBookings] = useState<VendorBooking[]>([]);
 const [loading, setLoading] = useState(true);
 const [status, setStatus] = useState('all');
 const [search, setSearch] = useState('');
 const [selected, setSelected] = useState<VendorBooking | null>(null);
 const [updating, setUpdating] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 loadBookings();
 }, [status]);

 const loadBookings = async () => {
 setLoading(true);
 try {
 const res = await getBookings(status === 'all' ? undefined : status, 1);
 setBookings(res.data);
 } catch {
 setBookings([]);
 } finally {
 setLoading(false);
 }
 };

 const handleView = async (id: number) => {
 setError(null);
 try {
 const booking = await getBooking(id);
 setSelected(booking);
 } catch {
 setError('Failed to load booking details.');
 }
 };

 const handleStatusUpdate = async (newStatus: 'confirmed' | 'cancelled') => {
 if (!selected) return;
 setUpdating(true);
 setError(null);
 try {
 await updateBookingStatus(selected.id, newStatus);
 const updated = await getBooking(selected.id);
 setSelected(updated);
 loadBookings();
 } catch (err: any) {
 const msg = err?.response?.data?.message ?? 'Failed to update status.';
 setError(msg);
 } finally {
 setUpdating(false);
 }
 };

 const filtered = bookings.filter((b) =>
 b.booking_ref.toLowerCase().includes(search.toLowerCase()) ||
 (b.customer?.name ?? '').toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div>
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
 <div>
 <h1 className="text-2xl font-bold text-text-primary">Bookings</h1>
 <p className="text-sm text-text-secondary mt-1">View and manage customer bookings.</p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-4 mb-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search by reference or customer..."
 className="w-full rounded-md border border-border pl-10 pr-4 py-2.5 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 </div>

 <div className="flex flex-wrap gap-2 mb-3">
 {STATUS_TABS.map((tab) => (
 <button
 key={tab}
 onClick={() => setStatus(tab)}
 className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
 status === tab
 ? 'bg-accent text-accent-inverse'
 : 'bg-surface-raised border border-border text-text-secondary hover:bg-surface-elevated'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>

 {loading ? (
 <div className="flex items-center justify-center h-32">
 <Loader2 className="w-6 h-6 text-text-primary animate-spin" />
 </div>
 ) : filtered.length === 0 ? (
 <div className="bg-surface-raised rounded-md p-4 text-center text-text-secondary">
 No bookings found.
 </div>
 ) : (
 <div className="bg-surface-raised rounded-md border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface-raised">
 <tr>
 <th className="px-4 py-3 text-left font-semibold text-text-primary">Ref</th>
 <th className="px-4 py-3 text-left font-semibold text-text-primary">Activity</th>
 <th className="px-4 py-3 text-left font-semibold text-text-primary">Customer</th>
 <th className="px-4 py-3 text-left font-semibold text-text-primary">Date / Time</th>
 <th className="px-4 py-3 text-left font-semibold text-text-primary">Travelers</th>
 <th className="px-4 py-3 text-left font-semibold text-text-primary">Total</th>
 <th className="px-4 py-3 text-left font-semibold text-text-primary">Status</th>
 <th className="px-4 py-3 text-right font-semibold text-text-primary">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map((b) => (
 <tr key={b.id} className="hover:bg-surface-elevated">
 <td className="px-4 py-3 font-medium text-text-primary">{b.booking_ref}</td>
 <td className="px-4 py-3 text-text-secondary">{b.activity?.title ?? '-'}</td>
 <td className="px-4 py-3 text-text-secondary">{b.customer?.name ?? '-'}</td>
 <td className="px-4 py-3 text-text-secondary">
 {b.booking_date ? b.booking_date : '-'}
 <br />
 {b.booking_time ? b.booking_time.slice(0, 5) : ''}
 </td>
 <td className="px-4 py-3 text-text-secondary">{b.traveler_count}</td>
 <td className="px-4 py-3 text-text-secondary">
 ${b.total_price} {b.currency.toUpperCase()}
 </td>
 <td className="px-4 py-3">
 <StatusBadge status={b.status} />
 </td>
 <td className="px-4 py-3 text-right">
 <button
 onClick={() => handleView(b.id)}
 className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
 >
 <Eye className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 <Modal
 isOpen={Boolean(selected)}
 onClose={() => setSelected(null)}
 title={`Booking ${selected?.booking_ref ?? ''}`}
 >
 {selected && (
 <div className="space-y-4">
 {error && (
 <div className="bg-error/10 text-error rounded-md p-3 text-sm">
 {error}
 </div>
 )}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-xs text-text-secondary">Customer</p>
 <p className="font-medium text-text-primary">
 {selected.customer?.name ?? '-'}
 </p>
 </div>
 <div>
 <p className="text-xs text-text-secondary">Email</p>
 <p className="font-medium text-text-primary">
 {selected.customer?.email ?? '-'}
 </p>
 </div>
 <div>
 <p className="text-xs text-text-secondary">Phone</p>
 <p className="font-medium text-text-primary">
 {selected.customer?.phone ?? '-'}
 </p>
 </div>
 <div>
 <p className="text-xs text-text-secondary">Travelers</p>
 <p className="font-medium text-text-primary">{selected.traveler_count}</p>
 </div>
 <div>
 <p className="text-xs text-text-secondary">Total</p>
 <p className="font-medium text-text-primary">
 ${selected.total_price} {selected.currency.toUpperCase()}
 </p>
 </div>
 <div>
 <p className="text-xs text-text-secondary">Commission</p>
 <p className="font-medium text-text-primary">
 ${selected.commission_amount}
 </p>
 </div>
 <div className="col-span-2">
 <p className="text-xs text-text-secondary">Special requests</p>
 <p className="text-text-primary">{selected.special_requests ?? 'None'}</p>
 </div>
 </div>

 <div className="border-t border-border pt-4">
 <p className="text-xs font-semibold text-text-primary mb-2">Status history</p>
 <div className="space-y-2">
 {(selected.status_history ?? []).map((h, idx) => (
 <div key={idx} className="flex items-center justify-between text-sm">
 <span className="capitalize text-text-primary">{h.status}</span>
 <span className="text-text-secondary">{h.created_at}</span>
 </div>
 ))}
 {!selected.status_history?.length && (
 <p className="text-sm text-text-secondary">No history.</p>
 )}
 </div>
 </div>

 <div className="flex gap-3 pt-2">
 {selected.status === 'pending' && (
 <button
 onClick={() => handleStatusUpdate('confirmed')}
 disabled={updating}
 className="flex-1 bg-success text-accent-inverse py-2.5 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
 >
 Confirm booking
 </button>
 )}
 {(selected.status === 'pending' || selected.status === 'confirmed') && (
 <button
 onClick={() => handleStatusUpdate('cancelled')}
 disabled={updating}
 className="flex-1 bg-error text-accent-inverse py-2.5 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
 >
 Cancel booking
 </button>
 )}
 </div>
 </div>
 )}
 </Modal>
 </div>
 );
}
