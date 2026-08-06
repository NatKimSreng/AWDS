import { useEffect, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { CreateUserData } from '../lib/api';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'provider', label: 'Provider' },
  { value: 'admin', label: 'Admin' },
];

export default function AddUserModal({ isOpen, onClose, onSubmit, isLoading }: AddUserModalProps) {
  const [form, setForm] = useState<CreateUserData>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        password_confirmation: '',
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (field: keyof CreateUserData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-raised rounded-md w-full max-w-md p-5 toast-enter">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-text-secondary hover:bg-surface-elevated"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-accent/10 text-text-primary">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Add User</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Role *</label>
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Confirm Password *</label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => update('password_confirmation', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
              required
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border text-sm font-medium text-text-primary hover:bg-surface-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-md text-sm font-medium text-accent-inverse bg-accent hover:bg-accent disabled:opacity-60"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
