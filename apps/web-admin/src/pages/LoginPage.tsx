import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [rememberMe, setRememberMe] = useState(false);
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
 device_name: 'web-admin',
 });

 const { user, token } = response.data;

 if (user?.role?.name !== 'admin') {
 setError('This portal is for administrators only.');
 setLoading(false);
 return;
 }

 setAuth(user, token);
 if (rememberMe) {
 localStorage.setItem('admin-remember-email', email);
 } else {
 localStorage.removeItem('admin-remember-email');
 }
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
 <div className="w-10 h-10 rounded-md bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-3">
 <Lock className="w-5 h-5 text-text-primary" />
 </div>
 <h1 className="text-lg font-semibold text-text-primary mb-1">Admin Portal</h1>
 <p className="text-text-muted text-sm">Sign in to manage the platform.</p>
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
 autoComplete="email"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
 <div className="relative">
 <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
 <input
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full rounded-md border border-border bg-surface pl-9 pr-9 py-2 text-sm text-text-primary focus:border-text-muted focus:ring-1 focus:ring-text-muted outline-none placeholder:text-text-muted"
 placeholder="••••••••"
 required
 autoComplete="current-password"
 />
 <button
 type="button"
 onClick={() => setShowPassword((v) => !v)}
 className="absolute right-2.5 top-2.5 p-0.5 rounded text-text-muted hover:text-text-primary"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <div className="flex items-center justify-between">
 <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
 <input
 type="checkbox"
 checked={rememberMe}
 onChange={(e) => setRememberMe(e.target.checked)}
 className="w-3.5 h-3.5 rounded border-border bg-surface text-text-primary focus:ring-0"
 />
 Remember me
 </label>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-text-primary text-accent-inverse font-medium text-sm py-2 rounded-md hover:bg-text-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
 >
 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
 Sign in
 </button>
 </form>
 </div>
 </div>
 );
}
