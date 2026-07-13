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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-charcoal">Bookings</h1>
          <p className="text-sm text-stone-gray mt-1">View and manage customer bookings.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or customer..."
            className="w-full rounded-xl border border-stone-gray/20 pl-10 pr-4 py-2.5 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
              status === tab
                ? 'bg-angkor-orange text-white'
                : 'bg-white border border-stone-gray/20 text-stone-gray hover:bg-stone-gray/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-angkor-orange animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card-white rounded-2xl p-8 text-center text-stone-gray">
          No bookings found.
        </div>
      ) : (
        <div className="bg-card-white rounded-2xl shadow-sm border border-stone-gray/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-cream">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-stone-charcoal">Ref</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-charcoal">Activity</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-charcoal">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-charcoal">Date / Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-charcoal">Travelers</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-charcoal">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-stone-charcoal">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-stone-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-gray/5">
                    <td className="px-4 py-3 font-medium text-stone-charcoal">{b.booking_ref}</td>
                    <td className="px-4 py-3 text-stone-gray">{b.activity?.title ?? '-'}</td>
                    <td className="px-4 py-3 text-stone-gray">{b.customer?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-stone-gray">
                      {b.booking_date ? b.booking_date : '-'}
                      <br />
                      {b.booking_time ? b.booking_time.slice(0, 5) : ''}
                    </td>
                    <td className="px-4 py-3 text-stone-gray">{b.traveler_count}</td>
                    <td className="px-4 py-3 text-stone-gray">
                      ${b.total_price} {b.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleView(b.id)}
                        className="p-2 rounded-lg text-stone-gray hover:text-angkor-orange hover:bg-angkor-orange/10"
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
              <div className="bg-error-red/10 text-error-red rounded-xl p-3 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-gray">Customer</p>
                <p className="font-medium text-stone-charcoal">
                  {selected.customer?.name ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-gray">Email</p>
                <p className="font-medium text-stone-charcoal">
                  {selected.customer?.email ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-gray">Phone</p>
                <p className="font-medium text-stone-charcoal">
                  {selected.customer?.phone ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-gray">Travelers</p>
                <p className="font-medium text-stone-charcoal">{selected.traveler_count}</p>
              </div>
              <div>
                <p className="text-xs text-stone-gray">Total</p>
                <p className="font-medium text-stone-charcoal">
                  ${selected.total_price} {selected.currency.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-gray">Commission</p>
                <p className="font-medium text-stone-charcoal">
                  ${selected.commission_amount}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-stone-gray">Special requests</p>
                <p className="text-stone-charcoal">{selected.special_requests ?? 'None'}</p>
              </div>
            </div>

            <div className="border-t border-stone-gray/10 pt-4">
              <p className="text-xs font-semibold text-stone-charcoal mb-2">Status history</p>
              <div className="space-y-2">
                {(selected.status_history ?? []).map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-stone-charcoal">{h.status}</span>
                    <span className="text-stone-gray">{h.created_at}</span>
                  </div>
                ))}
                {!selected.status_history?.length && (
                  <p className="text-sm text-stone-gray">No history.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {selected.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={updating}
                  className="flex-1 bg-success-green text-white py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Confirm booking
                </button>
              )}
              {(selected.status === 'pending' || selected.status === 'confirmed') && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updating}
                  className="flex-1 bg-error-red text-white py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
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
