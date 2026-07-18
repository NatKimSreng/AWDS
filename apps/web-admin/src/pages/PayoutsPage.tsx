import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

import { getPayouts, createPayout, markPayoutPaid, type AdminPayout, type PaginatedResponse } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
];

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PaginatedResponse<AdminPayout> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    provider_id: '',
    period_start: '',
    period_end: '',
    payout_method: '',
  });

  useEffect(() => {
    loadPayouts();
  }, [status, page]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const data = await getPayouts(status || undefined, undefined, page);
      setPayouts(data);
      setError(null);
    } catch {
      setError('Failed to load payouts.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.provider_id || !form.period_start || !form.period_end) return;
    try {
      await createPayout({
        provider_id: Number(form.provider_id),
        period_start: form.period_start,
        period_end: form.period_end,
        payout_method: form.payout_method || undefined,
      });
      setShowForm(false);
      setForm({ provider_id: '', period_start: '', period_end: '', payout_method: '' });
      loadPayouts();
    } catch {
      setError('Failed to create payout.');
    }
  };

  const handleMarkPaid = async (id: number) => {
    const ref = prompt('Enter transaction reference (optional):') ?? undefined;
    try {
      await markPayoutPaid(id, ref);
      loadPayouts();
    } catch {
      setError('Failed to mark payout as paid.');
    }
  };

  const formatMoney = (value: number | string | undefined, fallback = '—') => {
    if (value === undefined || value === null) return fallback;
    return `$${Number(value).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-angkor-orange text-white text-sm font-medium hover:bg-angkor-orange/90 transition-colors"
        >
          {showForm ? 'Close' : (<>
            <Plus className="w-4 h-4" /> New payout
          </>)}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card-white rounded-xl border border-stone-gray/10 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-gray">Provider ID</label>
              <input
                type="number"
                value={form.provider_id}
                onChange={(e) => setForm({ ...form, provider_id: e.target.value })}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 rounded-lg border border-stone-gray/20 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-gray">Period start</label>
              <input
                type="date"
                value={form.period_start}
                onChange={(e) => setForm({ ...form, period_start: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-gray/20 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-gray">Period end</label>
              <input
                type="date"
                value={form.period_end}
                onChange={(e) => setForm({ ...form, period_end: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-gray/20 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-gray">Payout method</label>
              <input
                type="text"
                value={form.payout_method}
                onChange={(e) => setForm({ ...form, payout_method: e.target.value })}
                placeholder="e.g. ABA Bank"
                className="w-full px-3 py-2 rounded-lg border border-stone-gray/20 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-angkor-orange text-white text-sm font-medium hover:bg-angkor-orange/90"
            >
              Create payout
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-stone-gray/20 text-sm text-stone-gray hover:bg-stone-gray/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
                  <th className="px-4 py-3 text-left font-medium">Provider</th>
                  <th className="px-4 py-3 text-left font-medium">Period</th>
                  <th className="px-4 py-3 text-left font-medium">Gross</th>
                  <th className="px-4 py-3 text-left font-medium">Commission</th>
                  <th className="px-4 py-3 text-left font-medium">Net</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {payouts?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-stone-gray">
                      No payouts found.
                    </td>
                  </tr>
                ) : (
                  payouts?.data.map((payout) => (
                    <tr key={payout.id} className="hover:bg-stone-gray/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-charcoal">{payout.provider?.business_name ?? '—'}</p>
                        <p className="text-xs text-stone-gray">{payout.payout_method ?? 'No method set'}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-gray">
                        {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-stone-charcoal">{formatMoney(payout.gross_amount)}</td>
                      <td className="px-4 py-3 text-stone-gray">{formatMoney(payout.commission)}</td>
                      <td className="px-4 py-3 font-medium text-stone-charcoal">{formatMoney(payout.net_amount)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={payout.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payout.status === 'pending' ? (
                          <button
                            onClick={() => handleMarkPaid(payout.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-success-green/10 text-success-green hover:bg-success-green/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark paid
                          </button>
                        ) : payout.transaction_ref ? (
                          <p className="text-xs text-stone-gray">Ref: {payout.transaction_ref}</p>
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

      {payouts && (
        <Pagination currentPage={payouts.current_page} lastPage={payouts.last_page} onPageChange={setPage} />
      )}
    </div>
  );
}
