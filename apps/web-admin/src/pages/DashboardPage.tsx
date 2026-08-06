import { useNavigate } from 'react-router-dom';
import {
 Users,
 Store,
 CalendarCheck,
 DollarSign,
 TrendingUp,
 ChevronRight,
 ArrowUpRight,
 ArrowDownRight,
 Wallet,
 CheckCircle2,
 XCircle,
 Clock,
} from 'lucide-react';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
 Legend,
} from 'recharts';

import { useDashboardStats, useProviderMutations } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { StatCardSkeleton, Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';

const COLORS = ['#ffffff', '#9ca3af', '#6b7280', '#ef4444', '#2a2a2a'];

interface TrendBadgeProps {
 current: number;
 previous: number;
}

function TrendBadge({ current, previous }: TrendBadgeProps) {
 if (previous === 0) return null;
 const change = ((current - previous) / previous) * 100;
 const isPositive = change >= 0;
 return (
 <span
 className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
 isPositive ? 'text-success' : 'text-error'
 }`}
 >
 {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
 {Math.abs(change).toFixed(0)}% vs last month
 </span>
 );
}

export default function DashboardPage() {
 const { data: stats, isLoading, error, refetch } = useDashboardStats();
 const navigate = useNavigate();
 const { showToast } = useToast();
 const { approve, reject } = useProviderMutations();

 if (error) {
 return (
 <ErrorState
 title="Failed to load dashboard"
 message={error?.message || 'Could not fetch dashboard data from the server.'}
 onRetry={refetch}
 />
 );
 }

 const chartData = stats ? [...stats.monthly_revenue].reverse() : [];
 const currentMonth = chartData[0] ?? { gross: 0, commission: 0, net: 0, bookings: 0 };
 const previousMonth = chartData[1] ?? { gross: 0, commission: 0, net: 0, bookings: 0 };

 const bookingStatusData = stats
 ? [
 { name: 'Pending', value: stats.pending_bookings, color: COLORS[4] },
 { name: 'Confirmed', value: stats.confirmed_bookings, color: COLORS[1] },
 { name: 'Completed', value: stats.completed_bookings, color: COLORS[2] },
 { name: 'Cancelled', value: stats.cancelled_bookings, color: COLORS[3] },
 ].filter((d) => d.value > 0)
 : [];

 const quickActions = [
 { label: 'Review providers', to: '/providers', icon: Store, count: stats?.pending_providers },
 { label: 'Review bookings', to: '/bookings', icon: CalendarCheck, count: stats?.pending_bookings },
 { label: 'Create payout', to: '/payouts', icon: Wallet },
 { label: 'Manage users', to: '/users', icon: Users },
 ];

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
 } catch {
 showToast('Failed to reject provider', 'error');
 }
 };

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
 {isLoading ? (
 <>
 <StatCardSkeleton />
 <StatCardSkeleton />
 <StatCardSkeleton />
 <StatCardSkeleton />
 <StatCardSkeleton />
 <StatCardSkeleton />
 </>
 ) : (
 <>
 <StatCard label="Total Users" value={stats!.total_users} icon={Users} />
 <StatCard label="Providers" value={stats!.total_providers} icon={Store} />
 <StatCard label="Bookings" value={stats!.total_bookings} icon={CalendarCheck} />
 <StatCard
 label="Gross Revenue"
 value={`$${Number(stats!.total_revenue_gross).toFixed(2)}`}
 icon={DollarSign}
 />
 <StatCard
 label="Commission"
 value={`$${Number(stats!.total_commission).toFixed(2)}`}
 icon={Wallet}
 />
 <StatCard
 label="Net Payout"
 value={`$${Number(stats!.total_net).toFixed(2)}`}
 icon={TrendingUp}
 />
 </>
 )}
 </div>

 {!isLoading && stats && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <div className="bg-surface-raised border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted uppercase">Current month gross</p>
 <p className="text-lg font-semibold text-text-primary">${Number(currentMonth.gross).toFixed(2)}</p>
 <div className="mt-1">
 <TrendBadge current={currentMonth.gross} previous={previousMonth.gross} />
 </div>
 </div>
 <div className="bg-surface-raised border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted uppercase">Current month net</p>
 <p className="text-lg font-semibold text-text-primary">${Number(currentMonth.net).toFixed(2)}</p>
 <div className="mt-1">
 <TrendBadge current={currentMonth.net} previous={previousMonth.net} />
 </div>
 </div>
 <div className="bg-surface-raised border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted uppercase">Current month bookings</p>
 <p className="text-lg font-semibold text-text-primary">{currentMonth.bookings}</p>
 <div className="mt-1">
 <TrendBadge current={currentMonth.bookings} previous={previousMonth.bookings} />
 </div>
 </div>
 <div className="bg-surface-raised border border-border rounded-md p-3">
 <p className="text-[11px] text-text-muted uppercase">Avg. booking value</p>
 <p className="text-lg font-semibold text-text-primary">
 ${stats!.total_bookings > 0 ? (Number(stats!.total_revenue_gross) / stats!.total_bookings).toFixed(2) : '0.00'}
 </p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-2 bg-surface-raised border border-border rounded-md p-4">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-text-secondary" />
 Monthly Revenue
 </h2>
 </div>
 {isLoading ? (
 <Skeleton className="h-64 w-full rounded-md" />
 ) : chartData.length === 0 ? (
 <p className="text-text-muted text-xs">No revenue data yet.</p>
 ) : (
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
 <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
 <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
 <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#fff' }} />
 <Bar dataKey="gross" fill="#ffffff" name="Gross" radius={[2, 2, 0, 0]} />
 <Bar dataKey="commission" fill="#6b7280" name="Commission" radius={[2, 2, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>

 <div className="space-y-4">
 <div className="bg-surface-raised border border-border rounded-md p-4">
 <h2 className="text-sm font-semibold text-text-primary mb-3">Booking Status</h2>
 {isLoading ? (
 <Skeleton className="h-40 w-full rounded-md" />
 ) : bookingStatusData.length === 0 ? (
 <p className="text-text-muted text-xs">No bookings yet.</p>
 ) : (
 <div className="h-48">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={bookingStatusData}
 dataKey="value"
 nameKey="name"
 cx="50%"
 cy="50%"
 innerRadius={40}
 outerRadius={70}
 paddingAngle={2}
 >
 {bookingStatusData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Legend iconType="circle" wrapperStyle={{ color: '#9ca3af', fontSize: '11px' }} />
 <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#fff' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>

 <div className="bg-surface-raised border border-border rounded-md p-4">
 <h2 className="text-sm font-semibold text-text-primary mb-3">Providers</h2>
 {isLoading ? (
 <Skeleton className="h-24 w-full rounded-md" />
 ) : (
 <div className="grid grid-cols-3 gap-2 text-center">
 <div className="p-2 rounded-md bg-surface border border-border">
 <p className="text-lg font-semibold text-text-primary">{stats!.pending_providers}</p>
 <p className="text-[10px] uppercase text-text-muted">Pending</p>
 </div>
 <div className="p-2 rounded-md bg-surface border border-border">
 <p className="text-lg font-semibold text-text-primary">{stats!.approved_providers}</p>
 <p className="text-[10px] uppercase text-text-muted">Approved</p>
 </div>
 <div className="p-2 rounded-md bg-surface border border-border">
 <p className="text-lg font-semibold text-text-primary">{stats!.rejected_providers}</p>
 <p className="text-[10px] uppercase text-text-muted">Rejected</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="bg-surface-raised border border-border rounded-md p-4">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
 <Clock className="w-4 h-4 text-text-secondary" />
 Pending Approvals
 </h2>
 <button
 onClick={() => navigate('/providers')}
 className="text-xs text-text-secondary font-medium flex items-center gap-1 hover:text-text-primary"
 >
 View all
 <ChevronRight className="w-3 h-3" />
 </button>
 </div>

 {isLoading ? (
 <div className="space-y-2">
 <Skeleton className="h-16 w-full rounded-md" count={3} />
 </div>
 ) : stats!.pending_provider_applications.length === 0 ? (
 <p className="text-text-muted text-xs">No pending provider applications.</p>
 ) : (
 <div className="space-y-2">
 {stats!.pending_provider_applications.map((provider) => (
 <div
 key={provider.id}
 className="p-2.5 rounded-md bg-surface border border-border hover:border-text-muted/30 transition"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <p className="font-medium text-text-primary text-xs truncate">
 {provider.business_name}
 </p>
 <p className="text-[11px] text-text-muted truncate">{provider.user?.email}</p>
 <div className="mt-1">
 <StatusBadge status={provider.verification_status} />
 </div>
 </div>
 <div className="flex items-center gap-0.5 shrink-0">
 <button
 onClick={() => handleApprove(provider.id, provider.business_name)}
 disabled={approve.isPending || reject.isPending}
 className="p-1.5 rounded text-success hover:bg-surface-elevated disabled:opacity-50"
 title="Approve"
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => handleReject(provider.id, provider.business_name)}
 disabled={approve.isPending || reject.isPending}
 className="p-1.5 rounded text-error hover:bg-surface-elevated disabled:opacity-50"
 title="Reject"
 >
 <XCircle className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
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

 {isLoading ? (
 <Skeleton className="h-40 w-full rounded-md" />
 ) : stats!.recent_bookings.length === 0 ? (
 <p className="text-text-muted text-xs">No bookings yet.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-left">
 <thead className="text-[11px] text-text-muted uppercase border-b border-border">
 <tr>
 <th className="py-2 font-medium">Ref</th>
 <th className="py-2 font-medium">Activity</th>
 <th className="py-2 font-medium">Customer</th>
 <th className="py-2 font-medium">Total</th>
 <th className="py-2 font-medium">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {stats!.recent_bookings.map((booking) => (
 <tr key={booking.id} className="hover:bg-surface-elevated/30 cursor-pointer" onClick={() => navigate(`/bookings/${booking.id}`)}>
 <td className="py-2 font-medium text-text-primary">{booking.booking_ref}</td>
 <td className="py-2 text-text-muted">{booking.activity?.title ?? '-'}</td>
 <td className="py-2 text-text-muted">{booking.customer?.name ?? '-'}</td>
 <td className="py-2 text-text-primary font-medium">
 ${Number(booking.total_price).toFixed(2)} {booking.currency}
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

 {isLoading ? (
 <Skeleton className="h-40 w-full rounded-md" />
 ) : (
 <div className="bg-surface-raised border border-border rounded-md p-4">
 <h3 className="text-sm font-semibold text-text-primary mb-3">Quick actions</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
 {quickActions.map((action) => {
 const Icon = action.icon;
 return (
 <button
 key={action.label}
 onClick={() => navigate(action.to)}
 className="flex items-center justify-between px-3 py-2 rounded-md bg-surface border border-border hover:border-text-muted/30 transition-colors text-left"
 >
 <span className="flex items-center gap-2 text-xs font-medium text-text-primary">
 <Icon className="w-3.5 h-3.5" />
 {action.label}
 {action.count !== undefined && action.count > 0 && (
 <span className="ml-1 px-1.5 py-0.5 rounded-full bg-surface-elevated text-text-primary text-[10px] font-bold border border-border">
 {action.count}
 </span>
 )}
 </span>
 <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>
 );
}
