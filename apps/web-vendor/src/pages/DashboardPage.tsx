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
 <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
 </div>
 );
 }

 if (error || !stats) {
 return (
 <div className="bg-error/10 text-error rounded-md p-3 text-sm">
 {error ?? 'Something went wrong.'}
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <StatCard label="Total Listings" value={stats.total_listings} icon={List} />
 <StatCard label="Live Listings" value={stats.live_listings} icon={LayoutDashboard} />
 <StatCard label="Total Bookings" value={stats.total_bookings} icon={CalendarCheck} />
 <StatCard label="Current Balance" value={`$${Number(stats.current_balance).toFixed(2)}`} icon={Wallet} />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-2 bg-surface-raised border border-border rounded-md p-4">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-text-secondary" />
 Quick Overview
 </h2>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <div className="bg-surface border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted">Pending</p>
 <p className="text-lg font-semibold text-text-primary">{stats.pending_bookings}</p>
 </div>
 <div className="bg-surface border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted">Confirmed</p>
 <p className="text-lg font-semibold text-text-primary">{stats.confirmed_bookings}</p>
 </div>
 <div className="bg-surface border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted">Completed</p>
 <p className="text-lg font-semibold text-text-primary">{stats.completed_bookings}</p>
 </div>
 <div className="bg-surface border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted">Cancelled</p>
 <p className="text-lg font-semibold text-text-primary">{stats.cancelled_bookings}</p>
 </div>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 <button
 onClick={() => navigate('/listings/new')}
 className="bg-text-primary text-accent-inverse px-3 py-2 rounded-md text-xs font-medium hover:bg-text-secondary transition-colors"
 >
 Add new listing
 </button>
 <button
 onClick={() => navigate('/bookings')}
 className="border border-border text-text-secondary px-3 py-2 rounded-md text-xs font-medium hover:bg-surface-elevated transition-colors"
 >
 View bookings
 </button>
 </div>
 </div>

 <div className="bg-surface-raised border border-border rounded-md p-4">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
 <MessageCircle className="w-4 h-4 text-text-secondary" />
 Messages
 </h2>
 {stats.unread_messages > 0 && (
 <span className="bg-surface-elevated text-text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-border">
 {stats.unread_messages}
 </span>
 )}
 </div>
 <p className="text-xs text-text-muted">
 {stats.unread_messages === 0
 ? 'No unread messages from travelers.'
 : `You have ${stats.unread_messages} unread message${stats.unread_messages === 1 ? '' : 's'}.`}
 </p>
 </div>
 </div>

 <div className="bg-surface-raised border border-border rounded-md p-4">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-semibold text-text-primary">Recent Bookings</h2>
 <button
 onClick={() => navigate('/bookings')}
 className="text-xs text-text-secondary font-medium flex items-center gap-1 hover:text-text-primary"
 >
 View all
 <ChevronRight className="w-3 h-3" />
 </button>
 </div>

 {stats.recent_bookings.length === 0 ? (
 <p className="text-text-muted text-xs">No bookings yet.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-left">
 <thead className="text-[11px] text-text-muted uppercase border-b border-border">
 <tr>
 <th className="py-2 font-medium">Ref</th>
 <th className="py-2 font-medium">Activity</th>
 <th className="py-2 font-medium">Travelers</th>
 <th className="py-2 font-medium">Total</th>
 <th className="py-2 font-medium">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {stats.recent_bookings.map((booking: VendorBooking) => (
 <tr key={booking.id}>
 <td className="py-2 font-medium text-text-primary">{booking.booking_ref}</td>
 <td className="py-2 text-text-muted">{booking.activity?.title ?? '-'}</td>
 <td className="py-2 text-text-muted">{booking.traveler_count}</td>
 <td className="py-2 text-text-primary font-medium">
 ${booking.total_price} {booking.currency}
 </td>
 <td className="py-2">
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
