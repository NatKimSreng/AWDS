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
        <Loader2 className="w-8 h-8 text-angkor-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-charcoal">Earnings</h1>
          <p className="text-sm text-stone-gray mt-1">Track revenue, commission, and payouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gross earnings"
          value={`$${(earnings?.gross ?? 0).toFixed(2)}`}
          icon={DollarSign}
          color="orange"
        />
        <StatCard
          label="Commission"
          value={`$${(earnings?.commission ?? 0).toFixed(2)}`}
          icon={TrendingUp}
          color="gray"
        />
        <StatCard
          label="Net earnings"
          value={`$${(earnings?.net ?? 0).toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Paid bookings"
          value={String(earnings?.bookings ?? 0)}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div className="bg-card-white rounded-2xl shadow-sm border border-stone-gray/10 p-6">
        <h2 className="text-lg font-bold text-stone-charcoal mb-4">Monthly breakdown</h2>
        {earnings?.monthly.length === 0 ? (
          <p className="text-sm text-stone-gray">No earnings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-cream">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Month</th>
                  <th className="px-4 py-3 text-right font-semibold">Bookings</th>
                  <th className="px-4 py-3 text-right font-semibold">Gross</th>
                  <th className="px-4 py-3 text-right font-semibold">Commission</th>
                  <th className="px-4 py-3 text-right font-semibold">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {earnings?.monthly.map((m) => (
                  <tr key={m.month}>
                    <td className="px-4 py-3 text-stone-charcoal">{m.month}</td>
                    <td className="px-4 py-3 text-right text-stone-gray">{m.bookings}</td>
                    <td className="px-4 py-3 text-right text-stone-gray">${m.gross.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-stone-gray">${m.commission.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-stone-charcoal">
                      ${m.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-card-white rounded-2xl shadow-sm border border-stone-gray/10 p-6">
        <h2 className="text-lg font-bold text-stone-charcoal mb-4">Payouts</h2>
        {payouts.length === 0 ? (
          <p className="text-sm text-stone-gray">No payouts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-cream">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Period</th>
                  <th className="px-4 py-3 text-right font-semibold">Gross</th>
                  <th className="px-4 py-3 text-right font-semibold">Commission</th>
                  <th className="px-4 py-3 text-right font-semibold">Net</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Paid at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-stone-charcoal">
                      {p.period_start} → {p.period_end}
                    </td>
                    <td className="px-4 py-3 text-right text-stone-gray">${p.gross_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-stone-gray">${p.commission.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-stone-charcoal">${p.net_amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          p.status === 'paid'
                            ? 'bg-success-green/10 text-success-green'
                            : p.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-stone-gray/10 text-stone-gray'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-gray">{p.paid_at ?? '-'}</td>
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
