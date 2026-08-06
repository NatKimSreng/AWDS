import { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Loader2, ChevronUp } from 'lucide-react';

import { usePayouts, useProviders, usePayoutMutations } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const STATUS_OPTIONS = [
 { value: '', label: 'All statuses' },
 { value: 'pending', label: 'Pending' },
 { value: 'paid', label: 'Paid' },
 { value: 'failed', label: 'Failed' },
];

export default function PayoutsPage() {
 const [status, setStatus] = useState('');
 const [page, setPage] = useState(1);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({
 provider_id: '',
 period_start: '',
 period_end: '',
 payout_method: '',
 });

 const { showToast } = useToast();

 const { data: payouts, isLoading: payoutsLoading, error: payoutsError, refetch: refetchPayouts } = usePayouts(
 status || undefined,
 undefined,
 page
 );
 const { data: providersData } = useProviders('approved', undefined, 1);
 const { create, markPaid } = usePayoutMutations();

 const approvedProviders = useMemo(
 () => providersData?.data.filter((p) => p.verification_status === 'approved') ?? [],
 [providersData]
 );

 const isMutating = create.isPending || markPaid.isPending;

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!form.provider_id || !form.period_start || !form.period_end) return;
 try {
 await create.mutateAsync({
 provider_id: Number(form.provider_id),
 period_start: form.period_start,
 period_end: form.period_end,
 payout_method: form.payout_method || undefined,
 });
 showToast('Payout created successfully', 'success');
 setShowForm(false);
 setForm({ provider_id: '', period_start: '', period_end: '', payout_method: '' });
 } catch {
 showToast('Failed to create payout', 'error');
 }
 };

 const handleMarkPaid = async (id: number) => {
 const ref = prompt('Enter transaction reference (optional):') ?? undefined;
 try {
 await markPaid.mutateAsync({ id, transactionRef: ref });
 showToast('Payout marked as paid', 'success');
 } catch {
 showToast('Failed to mark payout as paid', 'error');
 }
 };

 const formatMoney = (value: number | string | undefined, fallback = '—') => {
 if (value === undefined || value === null) return fallback;
 return `$${Number(value).toFixed(2)}`;
 };

 return (
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <select
 value={status}
 onChange={(e) => {
 setStatus(e.target.value);
 setPage(1);
 }}
 className="px-4 py-2.5 rounded-md border border-border bg-surface-raised text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 >
 {STATUS_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 </div>
 <button
 onClick={() => setShowForm(!showForm)}
 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-inverse text-sm font-medium hover:bg-accent transition-colors"
 >
 {showForm ? (
 <>
 <ChevronUp className="w-4 h-4" /> Close
 </>
 ) : (
 <>
 <Plus className="w-4 h-4" /> New payout
 </>
 )}
 </button>
 </div>

 {showForm && (
 <form onSubmit={handleCreate} className="bg-surface-raised rounded-md border border-border p-5 space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-medium text-text-secondary">Provider</label>
 <select
 value={form.provider_id}
 onChange={(e) => setForm({ ...form, provider_id: e.target.value })}
 className="w-full px-3 py-2 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-surface-raised text-text-primary"
 required
 >
 <option value="">Select a provider</option>
 {approvedProviders.map((provider) => (
 <option key={provider.id} value={provider.id}>
 {provider.business_name}
 </option>
 ))}
 </select>
 </div>
 <div className="space-y-1">
 <label className="text-xs font-medium text-text-secondary">Period start</label>
 <input
 type="date"
 value={form.period_start}
 onChange={(e) => setForm({ ...form, period_start: e.target.value })}
 className="w-full px-3 py-2 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-medium text-text-secondary">Period end</label>
 <input
 type="date"
 value={form.period_end}
 onChange={(e) => setForm({ ...form, period_end: e.target.value })}
 className="w-full px-3 py-2 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-medium text-text-secondary">Payout method</label>
 <input
 type="text"
 value={form.payout_method}
 onChange={(e) => setForm({ ...form, payout_method: e.target.value })}
 placeholder="e.g. ABA Bank"
 className="w-full px-3 py-2 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 </div>
 <div className="flex items-center gap-3">
 <button
 type="submit"
 disabled={isMutating}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-inverse text-sm font-medium hover:bg-accent disabled:opacity-50"
 >
 {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
 Create payout
 </button>
 <button
 type="button"
 onClick={() => setShowForm(false)}
 className="px-4 py-2 rounded-md border border-border text-sm text-text-secondary hover:bg-surface-elevated"
 >
 Cancel
 </button>
 </div>
 </form>
 )}

 {payoutsError && (
 <ErrorState
 title="Failed to load payouts"
 message={payoutsError?.message || 'Could not fetch payouts from the server.'}
 onRetry={refetchPayouts}
 />
 )}

 {payoutsLoading ? (
 <TableSkeleton rows={5} columns={7} />
 ) : payouts?.data.length === 0 ? (
 <EmptyState
 title="No payouts found"
 message={status ? 'Try a different status filter.' : 'No payouts have been created yet.'}
 icon="search"
 action={
 status
 ? { label: 'Clear filters', onClick: () => { setStatus(''); setPage(1); } }
 : undefined
 }
 />
 ) : (
 <div className="bg-surface-raised rounded-md border border-border overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface text-xs uppercase text-text-secondary">
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
 <tbody className="divide-y divide-border">
 {payouts?.data.map((payout) => (
 <tr key={payout.id} className="hover:bg-surface-elevated">
 <td className="px-4 py-3">
 <p className="font-medium text-text-primary">{payout.provider?.business_name ?? '—'}</p>
 <p className="text-xs text-text-secondary">{payout.payout_method ?? 'No method set'}</p>
 </td>
 <td className="px-4 py-3 text-text-secondary">
 {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
 </td>
 <td className="px-4 py-3 text-text-primary">{formatMoney(payout.gross_amount)}</td>
 <td className="px-4 py-3 text-text-secondary">{formatMoney(payout.commission)}</td>
 <td className="px-4 py-3 font-medium text-text-primary">{formatMoney(payout.net_amount)}</td>
 <td className="px-4 py-3">
 <StatusBadge status={payout.status} />
 </td>
 <td className="px-4 py-3 text-right">
 {payout.status === 'pending' ? (
 <button
 onClick={() => handleMarkPaid(payout.id)}
 disabled={isMutating}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50"
 >
 <CheckCircle2 className="w-3.5 h-3.5" /> Mark paid
 </button>
 ) : payout.transaction_ref ? (
 <p className="text-xs text-text-secondary">Ref: {payout.transaction_ref}</p>
 ) : (
 <span className="text-xs text-text-secondary">—</span>
 )}
 </td>
 </tr>
 ))}
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
