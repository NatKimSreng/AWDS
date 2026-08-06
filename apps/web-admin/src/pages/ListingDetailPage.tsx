import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
 ExternalLink,
 Star,
 StarOff,
 Clock,
 MapPin,
 Globe,
 CheckCircle2,
 Store,
 Tag,
 Users,
 DollarSign,
 ImageIcon,
 List,
 Info,
 Trash2,
} from 'lucide-react';

import { useListing, useListingMutations } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';
import DetailHeader from '../components/DetailHeader';
import InfoCard, { InfoRow, MetricCard } from '../components/InfoCard';
import StatusBadge from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import ConfirmModal from '../components/ConfirmModal';

const STATUS_OPTIONS = [
 { value: 'draft', label: 'Draft' },
 { value: 'pending', label: 'Pending' },
 { value: 'live', label: 'Live' },
 { value: 'paused', label: 'Paused' },
];

export default function ListingDetailPage() {
 const { id } = useParams<{ id: string }>();
 const listingId = Number(id);
 const navigate = useNavigate();
 const { showToast } = useToast();
 const [confirmDelete, setConfirmDelete] = useState(false);

 const { data: listing, isLoading, error, refetch } = useListing(listingId);
 const { updateStatus, delete: deleteMutation, toggleFeatured } = useListingMutations();

 const isMutating = updateStatus.isPending || deleteMutation.isPending || toggleFeatured.isPending;

 const handleStatusChange = async (newStatus: string) => {
 try {
 await updateStatus.mutateAsync({ id: listingId, status: newStatus });
 showToast(`Listing status updated to ${newStatus}`, 'success');
 } catch {
 showToast('Failed to update listing status', 'error');
 }
 };

 const handleToggleFeatured = async () => {
 try {
 await toggleFeatured.mutateAsync(listingId);
 showToast(`Listing ${listing?.is_featured ? 'unfeatured' : 'featured'}`, 'success');
 } catch {
 showToast('Failed to update featured status', 'error');
 }
 };

 const handleDelete = async () => {
 try {
 await deleteMutation.mutateAsync(listingId);
 showToast('Listing deleted', 'success');
 setConfirmDelete(false);
 } catch {
 showToast('Failed to delete listing', 'error');
 }
 };

 const formatDuration = (minutes: number) => {
 if (minutes < 60) return `${minutes}m`;
 const h = Math.floor(minutes / 60);
 const m = minutes % 60;
 return m === 0 ? `${h}h` : `${h}h ${m}m`;
 };

 if (isLoading) {
 return (
 <div className="space-y-3">
 <Skeleton className="h-10 w-1/3" />
 <Skeleton className="h-64 w-full rounded-md" />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <Skeleton className="h-80 lg:col-span-2" />
 <Skeleton className="h-80" />
 </div>
 </div>
 );
 }

 if (error || !listing) {
 return (
 <ErrorState
 title="Failed to load listing"
 message={error?.message || 'Could not fetch listing details.'}
 onRetry={refetch}
 />
 );
 }

 return (
 <div className="space-y-3">
 <DetailHeader
 title={listing.title}
 subtitle={listing.provider?.business_name}
 backTo="/listings"
 backLabel="Listings"
 meta={[
 { label: 'Status', value: listing.status, icon: CheckCircle2 },
 { label: 'Price', value: `$${Number(listing.base_price_usd).toFixed(2)}`, icon: DollarSign },
 ]}
 actions={
 <>
 <select
 value={listing.status}
 onChange={(e) => handleStatusChange(e.target.value)}
 disabled={isMutating}
 className="px-3 py-2 rounded-md border border-border bg-surface-raised text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none disabled:opacity-50"
 >
 {STATUS_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 <button
 onClick={handleToggleFeatured}
 disabled={isMutating}
 className={`px-4 py-2 rounded-md text-sm font-medium ${
 listing.is_featured
 ? 'bg-surface-raised text-text-primary hover:bg-surface-elevated'
 : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated'
 } disabled:opacity-50`}
 >
 {listing.is_featured ? (
 <>
 <Star className="w-4 h-4 inline mr-1 fill-white" /> Unfeature
 </>
 ) : (
 <>
 <StarOff className="w-4 h-4 inline mr-1" /> Feature
 </>
 )}
 </button>
 <a
 href={`/tours/${listing.slug}`}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium bg-accent text-accent-inverse hover:bg-accent "
 >
 <ExternalLink className="w-4 h-4" /> Preview
 </a>
 <button
 onClick={() => setConfirmDelete(true)}
 disabled={isMutating}
 className="px-4 py-2 rounded-md text-sm font-medium bg-error/10 text-error hover:bg-error/20 disabled:opacity-50"
 >
 <Trash2 className="w-4 h-4 inline mr-1" /> Delete
 </button>
 </>
 }
 />

 {listing.hero_image && (
 <div className="relative rounded-md overflow-hidden border border-border group">
 <img
 src={listing.hero_image}
 alt={listing.title}
 className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
 {listing.is_featured && (
 <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-surface-raised text-text-primary text-xs font-bold flex items-center gap-1">
 <Star className="w-3.5 h-3.5 fill-white" /> Featured
 </span>
 )}
 <div className="absolute bottom-4 left-4 text-text-primary">
 <p className="text-sm font-medium opacity-90">{listing.category?.name}</p>
 <p className="text-xs opacity-75">{listing.city?.name}</p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <MetricCard label="Status" value={<StatusBadge status={listing.status} />} icon={CheckCircle2} color="green" />
 <MetricCard label="Price" value={`$${Number(listing.base_price_usd).toFixed(2)}`} icon={DollarSign} color="orange" />
 <MetricCard label="Duration" value={formatDuration(listing.duration_minutes)} icon={Clock} color="blue" />
 <MetricCard label="Group size" value={`Up to ${listing.max_group}`} icon={Users} color="gray" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <div className="lg:col-span-2 space-y-3">
 <InfoCard title="Overview" icon={Info}>
 <InfoRow label="Category" value={listing.category?.name} icon={Tag} />
 <InfoRow label="City" value={listing.city?.name} icon={MapPin} />
 <InfoRow
 label="Instant book"
 value={
 listing.is_instant_book ? (
 <span className="inline-flex items-center gap-1 text-success">
 <CheckCircle2 className="w-4 h-4" /> Enabled
 </span>
 ) : (
 'Disabled'
 )
 }
 />
 <InfoRow
 label="Published"
 value={listing.published_at && new Date(listing.published_at).toLocaleString()}
 />
 </InfoCard>

 <InfoCard title="Description" icon={List}>
 <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">
 {listing.description ?? 'No description provided.'}
 </p>
 </InfoCard>

 {!!listing.itinerary && (
 <InfoCard title="Itinerary" icon={List}>
 <pre className="text-sm text-text-primary whitespace-pre-wrap bg-surface rounded-md p-4 overflow-x-auto">
 {JSON.stringify(listing.itinerary, null, 2)}
 </pre>
 </InfoCard>
 )}

 {((listing.inclusions?.length ?? 0) > 0 || (listing.exclusions?.length ?? 0) > 0) && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {(listing.inclusions?.length ?? 0) > 0 && (
 <InfoCard title="Inclusions" icon={CheckCircle2}>
 <ul className="space-y-2">
 {listing.inclusions?.map((item, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
 <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
 {item}
 </li>
 ))}
 </ul>
 </InfoCard>
 )}
 {(listing.exclusions?.length ?? 0) > 0 && (
 <InfoCard title="Exclusions" icon={Info}>
 <ul className="space-y-2">
 {listing.exclusions?.map((item, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
 <span className="w-4 h-4 rounded-full border-2 border-error shrink-0 mt-0.5" />
 {item}
 </li>
 ))}
 </ul>
 </InfoCard>
 )}
 </div>
 )}
 </div>

 <div className="space-y-3">
 <InfoCard title="Provider" icon={Store}>
 <InfoRow
 label="Business"
 value={
 listing.provider?.business_name ? (
 <button
 onClick={() => navigate(`/providers/${listing.provider?.id}`)}
 className="text-text-primary hover:underline"
 >
 {listing.provider.business_name}
 </button>
 ) : null
 }
 />
 <InfoRow
 label="Status"
 value={listing.provider?.verification_status && <StatusBadge status={listing.provider.verification_status} />}
 />
 </InfoCard>

 <InfoCard title="Meeting point" icon={MapPin}>
 <InfoRow
 label="Address"
 value={
 listing.meeting_point.address && (
 <span className="flex items-start gap-1">
 <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-secondary" /> {listing.meeting_point.address}
 </span>
 )
 }
 />
 <InfoRow
 label="Coordinates"
 value={
 listing.meeting_point.lat && listing.meeting_point.lng
 ? `${listing.meeting_point.lat}, ${listing.meeting_point.lng}`
 : null
 }
 />
 </InfoCard>

 {listing.spoken_languages && listing.spoken_languages.length > 0 && (
 <InfoCard title="Languages" icon={Globe}>
 <div className="flex flex-wrap gap-2">
 {listing.spoken_languages.map((lang) => (
 <span
 key={lang}
 className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-elevated text-text-secondary"
 >
 <Globe className="w-3 h-3" /> {lang}
 </span>
 ))}
 </div>
 </InfoCard>
 )}

 {listing.gallery.length > 0 && (
 <InfoCard title="Gallery" icon={ImageIcon}>
 <div className="grid grid-cols-2 gap-2">
 {listing.gallery.map((image) => (
 <div key={image.id} className="relative rounded-md overflow-hidden aspect-square group">
 <img src={image.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
 {image.is_hero && (
 <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-accent text-text-primary text-[10px] font-bold">
 HERO
 </span>
 )}
 </div>
 ))}
 </div>
 </InfoCard>
 )}
 </div>
 </div>

 <ConfirmModal
 isOpen={confirmDelete}
 title="Delete listing"
 message={`Are you sure you want to delete "${listing.title}"? This cannot be undone.`}
 confirmLabel="Delete"
 variant="danger"
 onConfirm={handleDelete}
 onCancel={() => setConfirmDelete(false)}
 />
 </div>
 );
}
