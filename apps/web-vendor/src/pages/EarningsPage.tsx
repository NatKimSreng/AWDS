import { useEffect, useState } from 'react';
import { DollarSign, Loader2, TrendingUp } from 'lucide-react';

import StatCard from '../components/StatCard';
import { getEarnings, getPayouts, type VendorEarningSummary, type VendorPayout } from '../lib/api';

export default function EarningsPage() {
 const [earnings, setEarnings] = useState<VendorEarningSummary | null>(null);
 const [payouts, setPayouts] = useState<VendorPayout[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadData();
 }, []);

 const loadData = async () => {
 try {
 const [earningsRes, payoutsRes] = await Promise.all([getEarnings(), getPayouts()]);
 setEarnings(earningsRes);
 setPayouts(payoutsRes);
 } catch {
 // silent
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
 </div>
 );
 }

 return (
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-text-primary">Earnings</h1>
 <p className="text-sm text-text-secondary mt-1">Track revenue, commission, and payouts.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard
 label="Gross earnings"
 value={`$${Number(earnings?.gross ?? 0).toFixed(2)}`}
 icon={DollarSign}
 />
 <StatCard
 label="Commission"
 value={`$${Number(earnings?.commission ?? 0).toFixed(2)}`}
 icon={TrendingUp}
 />
 <StatCard
 label="Net earnings"
 value={`$${Number(earnings?.net ?? 0).toFixed(2)}`}
 icon={DollarSign}
 />
 <StatCard
 label="Paid bookings"
 value={String(earnings?.bookings ?? 0)}
 icon={TrendingUp}
 />
 </div>

 <div className="bg-surface-raised rounded-md border border-border p-4">
 <h2 className="text-lg font-bold text-text-primary mb-4">Monthly breakdown</h2>
 {earnings?.monthly.length === 0 ? (
 <p className="text-sm text-text-secondary">No earnings yet.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface-raised">
 <tr>
 <th className="px-4 py-3 text-left font-semibold">Month</th>
 <th className="px-4 py-3 text-right font-semibold">Bookings</th>
 <th className="px-4 py-3 text-right font-semibold">Gross</th>
 <th className="px-4 py-3 text-right font-semibold">Commission</th>
 <th className="px-4 py-3 text-right font-semibold">Net</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {earnings?.monthly.map((m) => (
 <tr key={m.month}>
 <td className="px-4 py-3 text-text-primary">{m.month}</td>
 <td className="px-4 py-3 text-right text-text-secondary">{m.bookings}</td>
 <td className="px-4 py-3 text-right text-text-secondary">${Number(m.gross).toFixed(2)}</td>
 <td className="px-4 py-3 text-right text-text-secondary">${Number(m.commission).toFixed(2)}</td>
 <td className="px-4 py-3 text-right font-medium text-text-primary">
 ${Number(m.net).toFixed(2)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 <div className="bg-surface-raised rounded-md border border-border p-4">
 <h2 className="text-lg font-bold text-text-primary mb-4">Payouts</h2>
 {payouts.length === 0 ? (
 <p className="text-sm text-text-secondary">No payouts yet.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface-raised">
 <tr>
 <th className="px-4 py-3 text-left font-semibold">Period</th>
 <th className="px-4 py-3 text-right font-semibold">Gross</th>
 <th className="px-4 py-3 text-right font-semibold">Commission</th>
 <th className="px-4 py-3 text-right font-semibold">Net</th>
 <th className="px-4 py-3 text-left font-semibold">Status</th>
 <th className="px-4 py-3 text-left font-semibold">Paid at</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {payouts.map((p) => (
 <tr key={p.id}>
 <td className="px-4 py-3 text-text-primary">
 {p.period_start} → {p.period_end}
 </td>
 <td className="px-4 py-3 text-right text-text-secondary">${Number(p.gross_amount).toFixed(2)}</td>
 <td className="px-4 py-3 text-right text-text-secondary">${Number(p.commission).toFixed(2)}</td>
 <td className="px-4 py-3 text-right font-medium text-text-primary">${Number(p.net_amount).toFixed(2)}</td>
 <td className="px-4 py-3">
 <span
 className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
 p.status === 'paid'
 ? 'bg-success/10 text-success'
 : p.status === 'pending'
 ? 'bg-warning/10 text-warning'
 : 'bg-surface-elevated text-text-secondary'
 }`}
 >
 {p.status}
 </span>
 </td>
 <td className="px-4 py-3 text-text-secondary">{p.paid_at ?? '-'}</td>
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
