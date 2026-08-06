import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ShieldCheck, User, Eye, Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { useUsers, useUserMutations } from '../hooks/useAdmin';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AddUserModal from '../components/AddUserModal';
import type { AdminUser, CreateUserData } from '../lib/api';

const ROLE_OPTIONS = [
 { value: '', label: 'All roles' },
 { value: 'customer', label: 'Customer' },
 { value: 'provider', label: 'Provider' },
 { value: 'admin', label: 'Admin' },
];

export default function UsersPage() {
 const [role, setRole] = useState('');
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(1);
 const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
 const [isAddOpen, setIsAddOpen] = useState(false);

 const navigate = useNavigate();
 const { showToast } = useToast();
 const { updateRole, create } = useUserMutations();
 const debouncedQuery = useDebounce(query, 350);

 const { data: users, isLoading, error, refetch } = useUsers(role || undefined, debouncedQuery || undefined, page);

 const handleRoleChange = (userId: number, newRole: string, currentRole: string | undefined) => {
 if (newRole === currentRole) return;
 setUpdatingUserId(userId);
 updateRole.mutate(
 { id: userId, role: newRole },
 {
 onSuccess: () => {
 showToast(`Role updated to ${newRole}`, 'success');
 setUpdatingUserId(null);
 },
 onError: (err: any) => {
 showToast(err?.response?.data?.message || 'Failed to update role', 'error');
 setUpdatingUserId(null);
 },
 }
 );
 };

 const handleAddUser = (data: CreateUserData) => {
 create.mutate(data, {
 onSuccess: () => {
 showToast('User created successfully.', 'success');
 setIsAddOpen(false);
 },
 onError: (err: any) => {
 showToast(err?.response?.data?.message || 'Failed to create user', 'error');
 },
 });
 };

 const columns: ColumnDef<AdminUser>[] = [
 {
 accessorKey: 'name',
 header: 'User',
 cell: ({ row }) => {
 const user = row.original;
 return (
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-text-primary">
 <User className="w-4 h-4" />
 </div>
 <div>
 <p className="font-medium text-text-primary">{user.name}</p>
 <p className="text-xs text-text-secondary">{user.email}</p>
 </div>
 </div>
 );
 },
 },
 {
 accessorKey: 'role.name',
 header: 'Role',
 enableSorting: true,
 cell: ({ row }) => {
 const roleName = row.original.role?.name;
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-surface-elevated text-text-secondary">
 {roleName === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-text-primary" />}
 {row.original.role?.label ?? roleName ?? '—'}
 </span>
 );
 },
 },
 {
 accessorKey: 'email_verified_at',
 header: 'Verified',
 cell: ({ row }) => (
 <StatusBadge status={row.original.email_verified_at ? 'verified' : 'unverified'} />
 ),
 },
 {
 accessorKey: 'created_at',
 header: 'Joined',
 cell: ({ row }) =>
 new Date(row.original.created_at).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 }),
 },
 {
 id: 'actions',
 header: '',
 cell: ({ row }) => {
 const user = row.original;
 return (
 <div className="flex items-center justify-end gap-2">
 <select
 value={user.role?.name ?? ''}
 disabled={updatingUserId === user.id}
 onClick={(e) => e.stopPropagation()}
 onChange={(e) => handleRoleChange(user.id, e.target.value, user.role?.name)}
 className="px-2.5 py-1.5 rounded-md border border-border bg-surface-raised text-text-primary text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none disabled:opacity-60"
 >
 {ROLE_OPTIONS.filter((opt) => opt.value).map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 <button
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/users/${user.id}`);
 }}
 className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition"
 title="View details"
 >
 <Eye className="w-4 h-4" />
 </button>
 </div>
 );
 },
 },
 ];

 return (
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 value={query}
 onChange={(e) => {
 setQuery(e.target.value);
 setPage(1);
 }}
 placeholder="Search users by name or email..."
 className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <div className="flex items-center gap-3">
 <select
 value={role}
 onChange={(e) => {
 setRole(e.target.value);
 setPage(1);
 }}
 className="px-4 py-2.5 rounded-md border border-border bg-surface-raised text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 >
 {ROLE_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 <button
 onClick={() => setIsAddOpen(true)}
 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-inverse text-sm font-medium hover:bg-accent"
 >
 <Plus className="w-4 h-4" />
 Add User
 </button>
 </div>
 </div>

 <AddUserModal
 isOpen={isAddOpen}
 onClose={() => setIsAddOpen(false)}
 onSubmit={handleAddUser}
 isLoading={create.isPending}
 />

 <DataTable
 data={users?.data ?? []}
 columns={columns}
 isLoading={isLoading}
 error={error}
 onRetry={refetch}
 emptyTitle="No users found"
 emptyMessage={query ? 'Try a different search term or clear the filters.' : 'No users have signed up yet.'}
 emptyAction={
 query || role
 ? { label: 'Clear filters', onClick: () => { setQuery(''); setRole(''); setPage(1); } }
 : undefined
 }
 onRowClick={(user) => navigate(`/users/${user.id}`)}
 getRowId={(user) => String(user.id)}
 currentPage={users?.current_page}
 lastPage={users?.last_page}
 onPageChange={setPage}
 skeletonColumns={5}
 />
 </div>
 );
}
