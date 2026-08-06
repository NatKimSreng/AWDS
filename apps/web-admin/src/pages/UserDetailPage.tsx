import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
 Mail,
 Phone,
 Calendar,
 MapPin,
 ShieldCheck,
 Trash2,
 User,
 Globe,
 Home,
 FileText,
 Receipt,
} from 'lucide-react';

import { useUser, useUserMutations } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';
import DetailHeader from '../components/DetailHeader';
import InfoCard, { InfoRow } from '../components/InfoCard';
import StatusBadge from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import ConfirmModal from '../components/ConfirmModal';

const ROLE_OPTIONS = [
 { value: 'customer', label: 'Customer' },
 { value: 'provider', label: 'Provider' },
 { value: 'admin', label: 'Admin' },
];

export default function UserDetailPage() {
 const { id } = useParams<{ id: string }>();
 const userId = Number(id);
 const navigate = useNavigate();
 const { showToast } = useToast();
 const [confirmDelete, setConfirmDelete] = useState(false);

 const { data: user, isLoading, error, refetch } = useUser(userId);
 const { updateRole, delete: deleteMutation } = useUserMutations();

 const isMutating = updateRole.isPending || deleteMutation.isPending;

 const handleRoleChange = async (role: string) => {
 try {
 await updateRole.mutateAsync({ id: userId, role });
 showToast(`User role updated to ${role}`, 'success');
 } catch {
 showToast('Failed to update user role', 'error');
 }
 };

 const handleDelete = async () => {
 try {
 await deleteMutation.mutateAsync(userId);
 showToast('User deleted', 'success');
 setConfirmDelete(false);
 navigate('/users');
 } catch (err: any) {
 showToast(err?.response?.data?.message ?? 'Failed to delete user', 'error');
 }
 };

 if (isLoading) {
 return (
 <div className="space-y-3">
 <Skeleton className="h-10 w-1/3" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <Skeleton className="h-64 lg:col-span-2" />
 <Skeleton className="h-64" />
 </div>
 </div>
 );
 }

 if (error || !user) {
 return (
 <ErrorState
 title="Failed to load user"
 message={error?.message || 'Could not fetch user details.'}
 onRetry={refetch}
 />
 );
 }

 return (
 <div className="space-y-3">
 <DetailHeader
 title={user.name}
 subtitle={user.email}
 backTo="/users"
 backLabel="Users"
 meta={[
 { label: 'Role', value: user.role?.label ?? user.role?.name ?? 'Customer', icon: ShieldCheck },
 { label: 'Joined', value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar },
 ]}
 actions={
 <>
 <select
 value={user.role?.name ?? 'customer'}
 onChange={(e) => handleRoleChange(e.target.value)}
 disabled={isMutating}
 className="px-3 py-2 rounded-md border border-border bg-surface-raised text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none disabled:opacity-50"
 >
 {ROLE_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
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

 <div className="bg-surface-raised rounded-md border border-border p-4 transition- hover:">
 <div className="flex flex-col sm:flex-row items-start gap-5">
 <div className="w-20 h-20 rounded-md bg-gradient-to-br from-accent to-surface-elevated text-accent-inverse flex items-center justify-center text-3xl font-bold shrink-0 overflow-hidden ">
 {user.avatar_url ? (
 <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
 ) : (
 user.name.charAt(0).toUpperCase()
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
 <h2 className="text-xl font-bold text-text-primary font-heading">{user.name}</h2>
 <div className="flex items-center gap-2">
 <StatusBadge status={user.email_verified_at ? 'verified' : 'unverified'} />
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-surface-elevated text-text-secondary">
 {user.role?.name === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-text-primary" />}
 {user.role?.label ?? user.role?.name ?? 'Customer'}
 </span>
 </div>
 </div>
 <p className="text-sm text-text-secondary mt-1">{user.email}</p>
 {(user.country || user.nationality) && (
 <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5" />
 {[user.country, user.nationality].filter(Boolean).join(' • ')}
 </p>
 )}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <div className="lg:col-span-2 space-y-3">
 <InfoCard title="Profile" icon={User}>
 <InfoRow
 label="Email"
 icon={Mail}
 value={
 <a href={`mailto:${user.email}`} className="flex items-center gap-1 text-text-primary hover:underline">
 {user.email}
 </a>
 }
 />
 <InfoRow
 label="Phone"
 icon={Phone}
 value={
 user.phone ? (
 <span className="flex items-center gap-1">{user.phone}</span>
 ) : null
 }
 />
 <InfoRow
 label="Date of birth"
 icon={Calendar}
 value={user.date_of_birth && new Date(user.date_of_birth).toLocaleDateString()}
 />
 <InfoRow
 label="Joined"
 icon={Calendar}
 value={
 <span className="flex items-center gap-1">
 {new Date(user.created_at).toLocaleDateString()}
 </span>
 }
 />
 <InfoRow
 label="Language preference"
 icon={Globe}
 value={user.language_pref}
 />
 </InfoCard>

 <InfoCard title="Location & bio" icon={Home}>
 <InfoRow
 label="Country / Nationality"
 icon={MapPin}
 value={
 <span className="flex items-center gap-1">
 {[user.country, user.nationality].filter(Boolean).join(' • ') || '—'}
 </span>
 }
 />
 <InfoRow label="Address" icon={Home} value={user.address} />
 <InfoRow
 label="Bio"
 icon={FileText}
 value={user.bio || <span className="text-text-secondary italic">No bio provided.</span>}
 />
 </InfoCard>
 </div>

 <div className="space-y-3">
 <InfoCard
 title="Recent bookings"
 icon={Receipt}
 action={
 user.recent_bookings.length > 0 ? (
 <span className="text-xs text-text-secondary">{user.recent_bookings.length} booking(s)</span>
 ) : undefined
 }
 >
 {user.recent_bookings.length === 0 ? (
 <p className="text-sm text-text-secondary">No bookings yet.</p>
 ) : (
 <div className="space-y-3">
 {user.recent_bookings.map((booking) => (
 <button
 key={booking.id}
 onClick={() => navigate(`/bookings/${booking.id}`)}
 className="w-full text-left p-4 rounded-md bg-surface hover:bg-surface-elevated transition border border-transparent hover:border-border"
 >
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-text-primary flex items-center gap-1">
 <Receipt className="w-3.5 h-3.5 text-text-secondary" />
 {booking.booking_ref}
 </span>
 <StatusBadge status={booking.status} />
 </div>
 <p className="text-xs text-text-secondary mt-1 truncate">{booking.activity?.title ?? '—'}</p>
 <p className="text-xs text-text-primary font-medium mt-1">
 ${Number(booking.total_price).toFixed(2)} {booking.currency}
 </p>
 </button>
 ))}
 </div>
 )}
 </InfoCard>
 </div>
 </div>

 <ConfirmModal
 isOpen={confirmDelete}
 title="Delete user"
 message={`Are you sure you want to delete "${user.name}"? This action cannot be undone.`}
 confirmLabel="Delete"
 variant="danger"
 onConfirm={handleDelete}
 onCancel={() => setConfirmDelete(false)}
 />
 </div>
 );
}
