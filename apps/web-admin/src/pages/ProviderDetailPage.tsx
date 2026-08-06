import { useParams } from 'react-router-dom';
import {
 MapPin,
 Mail,
 Star,
 CheckCircle2,
 XCircle,
 Briefcase,
 Calendar,
 User,
 CreditCard,
 Award,
 Store,
 TrendingUp,
} from 'lucide-react';

import { useProvider, useProviderMutations } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';
import DetailHeader from '../components/DetailHeader';
import InfoCard, { InfoRow, MetricCard } from '../components/InfoCard';
import StatusBadge from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import ConfirmModal from '../components/ConfirmModal';
import { useState } from 'react';

export default function ProviderDetailPage() {
 const { id } = useParams<{ id: string }>();
 const providerId = Number(id);
 const { showToast } = useToast();
 const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

 const { data: provider, isLoading, error, refetch } = useProvider(providerId);
 const { approve, reject, toggleFeatured } = useProviderMutations();

 const isMutating = approve.isPending || reject.isPending || toggleFeatured.isPending;

 const handleApprove = async () => {
 try {
 await approve.mutateAsync(providerId);
 showToast('Provider approved', 'success');
 setConfirmAction(null);
 } catch {
 showToast('Failed to approve provider', 'error');
 }
 };

 const handleReject = async () => {
 try {
 await reject.mutateAsync({ id: providerId });
 showToast('Provider rejected', 'success');
 setConfirmAction(null);
 } catch {
 showToast('Failed to reject provider', 'error');
 }
 };

 const handleToggleFeatured = async () => {
 try {
 await toggleFeatured.mutateAsync(providerId);
 showToast(`Provider ${provider?.is_featured ? 'unfeatured' : 'featured'}`, 'success');
 } catch {
 showToast('Failed to update featured status', 'error');
 }
 };

 if (isLoading) {
 return (
 <div className="space-y-3">
 <Skeleton className="h-10 w-1/3" />
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

 if (error || !provider) {
 return (
 <ErrorState
 title="Failed to load provider"
 message={error?.message || 'Could not fetch provider details.'}
 onRetry={refetch}
 />
 );
 }

 const statusDate =
 provider.approved_at ?
 new Date(provider.approved_at).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 })
 : null;

 return (
 <div className="space-y-3">
 <DetailHeader
 title={provider.business_name}
 subtitle={provider.user?.email}
 backTo="/providers"
 backLabel="Providers"
 meta={[
 { label: 'Status', value: provider.verification_status, icon: Award },
 ...(statusDate ? [{ label: 'Approved', value: statusDate, icon: Calendar }] : []),
 { label: 'Bookings', value: provider.total_bookings, icon: TrendingUp },
 ]}
 actions={
 <>
 {provider.verification_status === 'pending' && (
 <>
 <button
 onClick={() => setConfirmAction('approve')}
 disabled={isMutating}
 className="px-4 py-2 rounded-md text-sm font-medium bg-success text-accent-inverse hover:bg-success disabled:opacity-50 "
 >
 <CheckCircle2 className="w-4 h-4 inline mr-1" /> Approve
 </button>
 <button
 onClick={() => setConfirmAction('reject')}
 disabled={isMutating}
 className="px-4 py-2 rounded-md text-sm font-medium bg-error text-accent-inverse hover:bg-error disabled:opacity-50 "
 >
 <XCircle className="w-4 h-4 inline mr-1" /> Reject
 </button>
 </>
 )}
 <button
 onClick={handleToggleFeatured}
 disabled={isMutating}
 className={`px-4 py-2 rounded-md text-sm font-medium ${
 provider.is_featured
 ? 'bg-surface-raised text-text-primary hover:bg-surface-elevated'
 : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated'
 } disabled:opacity-50`}
 >
 <Star className="w-4 h-4 inline mr-1" /> {provider.is_featured ? 'Unfeature' : 'Feature'}
 </button>
 </>
 }
 />

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <MetricCard
 label="Status"
 value={<StatusBadge status={provider.verification_status} />}
 icon={Award}
 color={provider.verification_status === 'approved' ? 'green' : 'orange'}
 />
 <MetricCard label="Rating" value={provider.avg_rating.toFixed(1)} icon={Star} color="gold" />
 <MetricCard label="Bookings" value={provider.total_bookings} icon={TrendingUp} color="blue" />
 <MetricCard label="Commission" value={`${provider.commission_rate}%`} icon={CreditCard} color="gray" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <div className="lg:col-span-2 space-y-3">
 <InfoCard title="Overview" icon={Store}>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
 <MetricCard
 label="Verification"
 value={<span className="capitalize">{provider.verification_status}</span>}
 icon={CheckCircle2}
 color={provider.verification_status === 'approved' ? 'green' : 'orange'}
 />
 <MetricCard label="Onboarding" value={<span className="capitalize">{provider.onboarding_status}</span>} icon={Briefcase} color="blue" />
 <MetricCard label="Average rating" value={provider.avg_rating.toFixed(1)} icon={Star} color="gold" />
 <MetricCard label="Total activities" value={provider.activities_count} icon={MapPin} color="orange" />
 </div>
 </InfoCard>

 <InfoCard title="About" icon={User}>
 <InfoRow label="Business name" value={provider.business_name} />
 <InfoRow
 label="Bio"
 value={provider.bio || <span className="text-text-secondary italic">No bio provided.</span>}
 />
 <InfoRow
 label="Service area"
 value={
 provider.service_area ? (
 <span className="flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5 text-text-secondary" /> {provider.service_area}
 </span>
 ) : null
 }
 />
 </InfoCard>
 </div>

 <div className="space-y-3">
 <InfoCard title="Contact" icon={Mail}>
 <InfoRow label="Name" value={provider.user?.name} />
 <InfoRow
 label="Email"
 value={
 provider.user?.email ? (
 <a
 href={`mailto:${provider.user.email}`}
 className="flex items-center gap-1 text-text-primary hover:underline"
 >
 <Mail className="w-3.5 h-3.5" /> {provider.user.email}
 </a>
 ) : null
 }
 />
 <InfoRow
 label="Joined"
 value={
 provider.created_at && (
 <span className="flex items-center gap-1">
 <Calendar className="w-3.5 h-3.5" /> {new Date(provider.created_at).toLocaleDateString()}
 </span>
 )
 }
 />
 {provider.approved_at && (
 <InfoRow
 label="Approved"
 value={
 <span className="flex items-center gap-1">
 <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {new Date(provider.approved_at).toLocaleDateString()}
 </span>
 }
 />
 )}
 </InfoCard>

 <InfoCard
 title="Payout accounts"
 icon={CreditCard}
 action={
 provider.payout_accounts.length > 0 ? (
 <span className="text-xs text-text-secondary">{provider.payout_accounts.length} account(s)</span>
 ) : undefined
 }
 >
 {provider.payout_accounts.length === 0 ? (
 <p className="text-sm text-text-secondary">No payout accounts set up yet.</p>
 ) : (
 <div className="space-y-3">
 {provider.payout_accounts.map((account) => (
 <div
 key={account.id}
 className="p-3 rounded-md bg-surface border border-border hover:border-accent/20 transition"
 >
 <div className="flex items-center justify-between">
 <p className="font-medium text-text-primary text-sm">{account.method}</p>
 {account.is_default && (
 <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-text-primary text-[10px] font-bold">
 DEFAULT
 </span>
 )}
 </div>
 <p className="text-xs text-text-secondary">{account.account_name}</p>
 <p className="text-xs text-text-secondary font-mono">{account.account_number}</p>
 </div>
 ))}
 </div>
 )}
 </InfoCard>
 </div>
 </div>

 <ConfirmModal
 isOpen={confirmAction === 'approve'}
 title="Approve provider"
 message={`Are you sure you want to approve "${provider.business_name}"? They will be able to publish listings and receive bookings.`}
 confirmLabel="Approve"
 onConfirm={handleApprove}
 onCancel={() => setConfirmAction(null)}
 />

 <ConfirmModal
 isOpen={confirmAction === 'reject'}
 title="Reject provider"
 message={`Are you sure you want to reject "${provider.business_name}"? This can be reversed later.`}
 confirmLabel="Reject"
 variant="danger"
 onConfirm={handleReject}
 onCancel={() => setConfirmAction(null)}
 />
 </div>
 );
}
