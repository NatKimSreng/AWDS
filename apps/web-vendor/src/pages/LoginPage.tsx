import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const setAuth = useAuthStore((state) => state.setAuth);
 const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 setLoading(true);

 try {
 const response = await api.post('/api/auth/login', {
 email,
 password,
 device_name: 'web-vendor',
 });

 const { user, token } = response.data;
 setAuth(user, token);
 navigate('/');
 } catch (err: any) {
 const message = err?.response?.data?.message ?? 'Login failed. Please try again.';
 setError(message);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-surface p-4">
 <div className="w-full max-w-sm bg-surface-raised border border-border rounded-md p-4">
 <div className="text-center mb-3">
 <h1 className="text-lg font-semibold text-text-primary mb-1">Vendor Portal</h1>
 <p className="text-text-muted text-sm">Sign in to manage your tours and bookings.</p>
 </div>

 {error && (
 <div className="bg-error/10 text-error rounded-md p-3 mb-5 text-sm">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
 <div className="relative">
 <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text-primary focus:border-text-muted focus:ring-1 focus:ring-text-muted outline-none placeholder:text-text-muted"
 placeholder="you@example.com"
 required
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
 <div className="relative">
 <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text-primary focus:border-text-muted focus:ring-1 focus:ring-text-muted outline-none placeholder:text-text-muted"
 placeholder="••••••••"
 required
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-text-primary text-accent-inverse font-medium text-sm py-2 rounded-md hover:bg-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
 Sign in
 </button>
 </form>
 </div>
 </div>
 );
}
