import { useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2, XCircle, Star } from 'lucide-react';

import { getProviders, approveProvider, rejectProvider, type AdminProvider, type PaginatedResponse } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<PaginatedResponse<AdminProvider> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProviders();
  }, [status, query, page]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await getProviders(status || undefined, query || undefined, page);
      setProviders(data);
      setError(null);
    } catch {
      setError('Failed to load providers.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveProvider(id);
      loadProviders();
    } catch {
      setError('Failed to approve provider.');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this provider application?')) return;
    try {
      await rejectProvider(id);
      loadProviders();
    } catch {
      setError('Failed to reject provider.');
    }
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
            placeholder="Search providers..."
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
                  <th className="px-4 py-3 text-left font-medium">Provider</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Rating</th>
                  <th className="px-4 py-3 text-left font-medium">Bookings</th>
                  <th className="px-4 py-3 text-left font-medium">Commission</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {providers?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-gray">
                      No providers found.
                    </td>
                  </tr>
                ) : (
                  providers?.data.map((provider) => (
                    <tr key={provider.id} className="hover:bg-stone-gray/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-charcoal">{provider.business_name}</p>
                        <p className="text-xs text-stone-gray">{provider.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={provider.verification_status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-khmer-gold">
                          <Star className="w-3.5 h-3.5 fill-khmer-gold" /> {provider.avg_rating}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-gray">{provider.total_bookings}</td>
                      <td className="px-4 py-3 text-stone-gray">{provider.commission_rate}% </td>
                      <td className="px-4 py-3 text-right">
                        {provider.verification_status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(provider.id)}
                              className="p-2 rounded-lg text-success-green hover:bg-success-green/10"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(provider.id)}
                              className="p-2 rounded-lg text-error-red hover:bg-error-red/10"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
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

      {providers && (
        <Pagination currentPage={providers.current_page} lastPage={providers.last_page} onPageChange={setPage} />
      )}
    </div>
  );
}
