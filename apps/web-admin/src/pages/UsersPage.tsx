import { useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle, ShieldCheck, User } from 'lucide-react';

import { getUsers, type AdminUser, type PaginatedResponse } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'provider', label: 'Provider' },
  { value: 'admin', label: 'Admin' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [role, query, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(role || undefined, query || undefined, page);
      setUsers(data);
      setError(null);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
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
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-gray/20 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-gray/20 bg-white focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
        >
          {ROLE_OPTIONS.map((opt) => (
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
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Verified</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-gray/10">
                {users?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-gray">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users?.data.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-gray/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-angkor-orange/10 flex items-center justify-center text-angkor-orange">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-charcoal">{user.name}</p>
                            <p className="text-xs text-stone-gray">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-stone-gray/10 text-stone-gray">
                          {user.role?.name === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-angkor-orange" />}
                          {user.role?.label ?? user.role?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.email_verified_at ? 'verified' : 'unverified'} />
                      </td>
                      <td className="px-4 py-3 text-stone-gray">
                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-stone-gray">—</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {users && (
        <Pagination currentPage={users.current_page} lastPage={users.last_page} onPageChange={setPage} />
      )}
    </div>
  );
}
