import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  CalendarCheck,
  Wallet,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import { getDashboardStats, type VendorDashboardStats, type VendorBooking } from '../lib/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-angkor-orange animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-error-red/10 text-error-red rounded-xl p-4">
        {error ?? 'Something went wrong.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={stats.total_listings} icon={List} color="orange" />
        <StatCard label="Live Listings" value={stats.live_listings} icon={LayoutDashboard} color="green" />
        <StatCard label="Total Bookings" value={stats.total_bookings} icon={CalendarCheck} color="blue" />
        <StatCard label="Current Balance" value={`$${Number(stats.current_balance).toFixed(2)}`} icon={Wallet} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card-white rounded-xl shadow-sm border border-stone-gray/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-charcoal flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-angkor-orange" />
              Quick Overview
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-sand-bg rounded-xl p-4">
              <p className="text-xs text-stone-gray">Pending</p>
              <p className="text-xl font-bold text-stone-charcoal">{stats.pending_bookings}</p>
            </div>
            <div className="bg-sand-bg rounded-xl p-4">
              <p className="text-xs text-stone-gray">Confirmed</p>
              <p className="text-xl font-bold text-stone-charcoal">{stats.confirmed_bookings}</p>
            </div>
            <div className="bg-sand-bg rounded-xl p-4">
              <p className="text-xs text-stone-gray">Completed</p>
              <p className="text-xl font-bold text-stone-charcoal">{stats.completed_bookings}</p>
            </div>
            <div className="bg-sand-bg rounded-xl p-4">
              <p className="text-xs text-stone-gray">Cancelled</p>
              <p className="text-xl font-bold text-stone-charcoal">{stats.cancelled_bookings}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/listings/new')}
              className="bg-angkor-orange text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-angkor-orange-dark transition-colors"
            >
              Add new listing
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="border border-stone-gray/20 text-stone-charcoal px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-gray/5 transition-colors"
            >
              View bookings
            </button>
          </div>
        </div>

        <div className="bg-card-white rounded-xl shadow-sm border border-stone-gray/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-charcoal flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-angkor-orange" />
              Messages
            </h2>
            {stats.unread_messages > 0 && (
              <span className="bg-angkor-orange text-white text-xs font-bold px-2 py-1 rounded-full">
                {stats.unread_messages}
              </span>
            )}
          </div>
          <p className="text-sm text-stone-gray">
            {stats.unread_messages === 0
              ? 'No unread messages from travelers.'
              : `You have ${stats.unread_messages} unread message${stats.unread_messages === 1 ? '' : 's'}.`}
          </p>
        </div>
      </div>

      <div className="bg-card-white rounded-xl shadow-sm border border-stone-gray/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-charcoal">Recent Bookings</h2>
          <button
            onClick={() => navigate('/bookings')}
            className="text-sm text-angkor-orange font-medium flex items-center gap-1 hover:underline"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {stats.recent_bookings.length === 0 ? (
          <p className="text-stone-gray text-sm">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-stone-gray uppercase border-b border-stone-gray/10">
                <tr>
                  <th className="py-3 font-medium">Ref</th>
                  <th className="py-3 font-medium">Activity</th>
                  <th className="py-3 font-medium">Travelers</th>
                  <th className="py-3 font-medium">Total</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {stats.recent_bookings.map((booking: VendorBooking) => (
                  <tr key={booking.id}>
                    <td className="py-3 font-medium text-stone-charcoal">{booking.booking_ref}</td>
                    <td className="py-3 text-stone-gray">{booking.activity?.title ?? '-'}</td>
                    <td className="py-3 text-stone-gray">{booking.traveler_count}</td>
                    <td className="py-3 text-stone-charcoal font-medium">
                      ${booking.total_price} {booking.currency}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
