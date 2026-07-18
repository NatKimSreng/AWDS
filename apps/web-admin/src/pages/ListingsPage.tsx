import { useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, Trash2, Star, Eye } from 'lucide-react';

import { getListings, updateListingStatus, deleteListing, type AdminListing, type PaginatedResponse } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
  { value: 'paused', label: 'Paused' },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<PaginatedResponse<AdminListing> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadListings();
  }, [status, query, page]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await getListings(status || undefined, undefined, query || undefined, page);
      setListings(data);
      setError(null);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateListingStatus(id, newStatus);
      loadListings();
    } catch {
      setError('Failed to update listing status.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete listing "${title}"? This cannot be undone.`)) return;
    try {
      await deleteListing(id);
      loadListings();
    } catch {
      setError('Failed to delete listing.');
    }
  };

  const formatPrice = (value: number | string | undefined) => {
    if (value === undefined || value === null) return '—';
    return `$${Number(value).toFixed(2)}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
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
            placeholder="Search listings..."
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
                  <th className="px-4 py-3 text-left font-medium">Listing</th>
                  <th className="px-4 py-3 text-left font-medium">Provider</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {listings?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-gray">
                      No listings found.
                    </td>
                  </tr>
                ) : (
                  listings?.data.map((listing) => (
                    <tr key={listing.id} className="hover:bg-stone-gray/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-charcoal">{listing.title}</p>
                        <div className="flex items-center gap-2 text-xs text-stone-gray mt-1">
                          <span>{listing.category?.name}</span>
                          <span>•</span>
                          <span>{listing.city?.name}</span>
                          {listing.is_featured && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-khmer-gold">
                                <Star className="w-3 h-3 fill-khmer-gold" /> Featured
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-stone-charcoal">{listing.provider?.business_name ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="px-4 py-3 text-stone-charcoal">{formatPrice(listing.base_price_usd)}</td>
                      <td className="px-4 py-3 text-stone-gray">{formatDuration(listing.duration_minutes)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={listing.status}
                            onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-stone-gray/20 text-xs focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                          >
                            {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <a
                            href={`/tours/${listing.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-stone-gray hover:bg-stone-gray/10"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(listing.id, listing.title)}
                            className="p-2 rounded-lg text-error-red hover:bg-error-red/10"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {listings && (
        <Pagination currentPage={listings.current_page} lastPage={listings.last_page} onPageChange={setPage} />
      )}
    </div>
  );
}
