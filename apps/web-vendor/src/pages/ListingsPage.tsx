import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, AlertCircle, Edit2, Trash2 } from 'lucide-react';

import { getListings, deleteListing, type VendorListing } from '../lib/api';
import StatusBadge from '../components/StatusBadge';

export default function ListingsPage() {
 const [listings, setListings] = useState<VendorListing[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [search, setSearch] = useState('');
 const navigate = useNavigate();

 useEffect(() => {
 loadListings();
 }, []);

 const loadListings = async () => {
 try {
 setLoading(true);
 const response = await getListings();
 setListings(response.data);
 } catch (err) {
 setError('Failed to load listings.');
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id: number) => {
 if (!confirm('Are you sure you want to delete this listing?')) return;

 try {
 await deleteListing(id);
 setListings((prev) => prev.filter((l) => l.id !== id));
 } catch (err) {
 setError('Failed to delete listing.');
 }
 };

 const filtered = listings.filter((l) =>
 l.title.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="relative max-w-sm">
 <Search className="absolute left-4 top-3 w-5 h-5 text-text-secondary" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search listings..."
 className="w-full pl-12 pr-4 py-2.5 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <button
 onClick={() => navigate('/listings/new')}
 className="bg-accent text-accent-inverse px-4 py-2.5 rounded-md text-sm font-medium hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2"
 >
 <Plus className="w-4 h-4" />
 New listing
 </button>
 </div>

 {error && (
 <div className="bg-error/10 text-error rounded-md p-4 flex items-start gap-3">
 <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
 <p className="text-sm">{error}</p>
 </div>
 )}

 {loading ? (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
 </div>
 ) : filtered.length === 0 ? (
 <div className="bg-surface-raised rounded-md border border-border p-5 text-center">
 <p className="text-text-secondary mb-4">{search ? 'No listings match your search.' : 'You have no listings yet.'}</p>
 {!search && (
 <button
 onClick={() => navigate('/listings/new')}
 className="bg-accent text-accent-inverse px-4 py-2.5 rounded-md text-sm font-medium hover:bg-surface-elevated transition-colors"
 >
 Create your first listing
 </button>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {filtered.map((listing) => (
 <div
 key={listing.id}
 className="bg-surface-raised rounded-md border border-border overflow-hidden"
 >
 <div className="h-40 bg-surface overflow-hidden">
 {listing.hero_image ? (
 <img
 src={listing.hero_image}
 alt={listing.title}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-text-secondary">
 No image
 </div>
 )}
 </div>
 <div className="p-5">
 <div className="flex items-start justify-between gap-2 mb-2">
 <h3 className="font-bold text-text-primary line-clamp-1">{listing.title}</h3>
 <StatusBadge status={listing.status} />
 </div>
 <p className="text-sm text-text-secondary mb-3">
 {listing.city?.name ?? 'No city'} · {Math.round(listing.duration_minutes / 60)}h
 </p>
 <div className="flex items-center justify-between">
 <p className="text-lg font-bold text-text-primary">
 ${Number(listing.base_price_usd).toFixed(2)}
 </p>
 <div className="flex gap-2">
 <button
 onClick={() => navigate(`/listings/${listing.id}/edit`)}
 className="p-2 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
 >
 <Edit2 className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleDelete(listing.id)}
 className="p-2 rounded-md border border-border text-text-secondary hover:text-error hover:border-error transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
