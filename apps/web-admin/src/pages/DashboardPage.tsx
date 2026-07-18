import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Store,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { getDashboardStats, type AdminDashboardStats } from '../lib/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
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
    } catch {
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
      <div className="bg-error-red/10 text-error-red rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <p className="text-sm">{error ?? 'Something went wrong.'}</p>
      </div>
    );
  }

  const chartData = [...stats.monthly_revenue].reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total_users} icon={Users} color="blue" />
        <StatCard label="Providers" value={stats.total_providers} icon={Store} color="orange" />
        <StatCard label="Bookings" value={stats.total_bookings} icon={CalendarCheck} color="green" />
        <StatCard
          label="Total Revenue"
          value={`$${Number(stats.total_revenue_gross).toFixed(2)}`}
          icon={DollarSign}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card-white rounded-xl shadow-sm border border-stone-gray/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-charcoal flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-angkor-orange" />
              Monthly Revenue
            </h2>
          </div>
          {chartData.length === 0 ? (
            <p className="text-stone-gray text-sm">No revenue data yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="gross" fill="#C8530A" name="Gross" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" fill="#6B635C" name="Commission" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card-white rounded-xl shadow-sm border border-stone-gray/10 p-6">
          <h2 className="text-lg font-bold text-stone-charcoal mb-4">Pending Approvals</h2>
          {stats.pending_provider_applications.length === 0 ? (
            <p className="text-stone-gray text-sm">No pending provider applications.</p>
          ) : (
            <div className="space-y-3">
              {stats.pending_provider_applications.map((provider) => (
                <div
                  key={provider.id}
                  className="p-3 rounded-xl bg-sand-bg hover:bg-stone-gray/5 cursor-pointer transition"
                  onClick={() => navigate('/providers')}
                >
                  <p className="font-medium text-stone-charcoal text-sm">{provider.business_name}</p>
                  <p className="text-xs text-stone-gray">{provider.user?.email}</p>
                  <div className="mt-2">
                    <StatusBadge status={provider.verification_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/providers')}
            className="mt-4 text-sm text-angkor-orange font-medium flex items-center gap-1 hover:underline"
          >
            Manage providers
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card-white rounded-xl p-4 border border-stone-gray/10">
          <p className="text-xs text-stone-gray uppercase">Pending Bookings</p>
          <p className="text-xl font-bold text-stone-charcoal">{stats.pending_bookings}</p>
        </div>
        <div className="bg-card-white rounded-xl p-4 border border-stone-gray/10">
          <p className="text-xs text-stone-gray uppercase">Confirmed</p>
          <p className="text-xl font-bold text-stone-charcoal">{stats.confirmed_bookings}</p>
        </div>
        <div className="bg-card-white rounded-xl p-4 border border-stone-gray/10">
          <p className="text-xs text-stone-gray uppercase">Completed</p>
          <p className="text-xl font-bold text-stone-charcoal">{stats.completed_bookings}</p>
        </div>
        <div className="bg-card-white rounded-xl p-4 border border-stone-gray/10">
          <p className="text-xs text-stone-gray uppercase">Cancelled</p>
          <p className="text-xl font-bold text-stone-charcoal">{stats.cancelled_bookings}</p>
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
                  <th className="py-3 font-medium">Customer</th>
                  <th className="py-3 font-medium">Total</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {stats.recent_bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="py-3 font-medium text-stone-charcoal">{booking.booking_ref}</td>
                    <td className="py-3 text-stone-gray">{booking.activity?.title ?? '-'}</td>
                    <td className="py-3 text-stone-gray">{booking.customer?.name ?? '-'}</td>
                    <td className="py-3 text-stone-charcoal font-medium">
                      ${Number(booking.total_price).toFixed(2)} {booking.currency}
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
