import { useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, Calendar, Users } from 'lucide-react';

import { getBookings, updateBookingStatus, type AdminBooking, type PaginatedResponse } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<PaginatedResponse<AdminBooking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadBookings();
  }, [status, query, page]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings(status || undefined, query || undefined, page);
      setBookings(data);
      setError(null);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateBookingStatus(id, newStatus);
      loadBookings();
    } catch {
      setError('Failed to update booking status.');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-gray" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ref, activity, or customer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-gray/20 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-gray/20 bg-white focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-error-red/10 text-error-red rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-angkor-orange animate-spin" />
        </div>
      ) : (
        <div className="bg-card-white rounded-xl shadow-sm border border-stone-gray/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand-bg text-xs uppercase text-stone-gray">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Booking</th>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Date & Travelers</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {bookings?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-gray">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings?.data.map((booking) => (
                    <tr key={booking.id} className="hover:bg-stone-gray/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-charcoal">{booking.booking_ref}</p>
                        <p className="text-xs text-stone-gray mt-1">{booking.activity?.title ?? '—'}</p>
                        <p className="text-xs text-stone-gray">{booking.provider?.business_name ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-stone-charcoal">{booking.customer?.name ?? 'Guest'}</p>
                        <p className="text-xs text-stone-gray">{booking.customer?.email ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-stone-charcoal">
                          <Calendar className="w-3.5 h-3.5 text-stone-gray" />
                          <span>{formatDate(booking.booking_date)}</span>
                          {booking.booking_time && <span className="text-stone-gray">{booking.booking_time}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-gray mt-1">
                          <Users className="w-3.5 h-3.5" />
                          {booking.traveler_count} travelers
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-charcoal">
                        {formatPrice(booking.total_price, booking.currency)}
                        <p className="text-xs text-stone-gray">Commission: {formatPrice(booking.commission_amount, booking.currency)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' ? (
                          <div className="flex items-center justify-end gap-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-success-green/10 text-success-green hover:bg-success-green/20"
                              >
                                Confirm
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(booking.id, 'completed')}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-angkor-orange/10 text-angkor-orange hover:bg-angkor-orange/20"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const note = prompt('Reason for cancellation (optional):') ?? undefined;
                                updateBookingStatus(booking.id, 'cancelled', note).then(loadBookings).catch(() => setError('Failed to cancel booking.'));
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-error-red/10 text-error-red hover:bg-error-red/20"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-gray">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bookings && (
        <Pagination currentPage={bookings.current_page} lastPage={bookings.last_page} onPageChange={setPage} />
      )}
    </div>
  );
}
