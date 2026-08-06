import { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
 LayoutDashboard,
 Users,
 Store,
 List,
 CalendarCheck,
 Wallet,
 LogOut,
 Menu,
 Bell,
 RefreshCw,
 Sun,
 Moon,
} from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { useDashboardStats } from '../hooks/useAdmin';

const NAV_ITEMS = [
 { to: '/', label: 'Dashboard', icon: LayoutDashboard },
 { to: '/providers', label: 'Providers', icon: Store },
 { to: '/listings', label: 'Listings', icon: List },
 { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
 { to: '/payouts', label: 'Payouts', icon: Wallet },
 { to: '/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
 const [mobileOpen, setMobileOpen] = useState(false);
 const [notifOpen, setNotifOpen] = useState(false);
 const bellRef = useRef<HTMLButtonElement>(null);
 const user = useAuthStore((state) => state.user);
 const clearAuth = useAuthStore((state) => state.clearAuth);
 const navigate = useNavigate();
 const location = useLocation();
 const queryClient = useQueryClient();
 const { showToast } = useToast();
 const { data: stats } = useDashboardStats();
 const { theme, toggleTheme } = useThemeStore();

 const handleLogout = () => {
 clearAuth();
 navigate('/login');
 };

 const refreshData = async () => {
 await queryClient.invalidateQueries({ queryKey: ['admin'] });
 showToast('Data refreshed', 'success');
 };

 const pageTitle = useMemo(() => {
 const exact = NAV_ITEMS.find((item) => item.to === location.pathname);
 if (exact) return exact.label;

 const parts = location.pathname.split('/').filter(Boolean);
 if (parts.length >= 2 && /^\d+$/.test(parts[1]!)) {
 const parent = NAV_ITEMS.find((item) => item.to === `/${parts[0]}`)?.label;
 return parent ? `${parent.slice(0, -1)} Details` : 'Details';
 }

 const segment = parts[0];
 return NAV_ITEMS.find((item) => item.to === `/${segment}`)?.label ?? 'Admin';
 }, [location.pathname]);

 const pendingCount = (stats?.pending_providers ?? 0) + (stats?.pending_bookings ?? 0);
 const notifications = [
 ...(stats?.pending_providers
 ? [{
 id: 'pending-providers',
 message: `${stats.pending_providers} provider application${stats.pending_providers === 1 ? '' : 's'} pending approval`,
 link: '/providers',
 type: 'provider' as const,
 }]
 : []),
 ...(stats?.pending_bookings
 ? [{
 id: 'pending-bookings',
 message: `${stats.pending_bookings} booking${stats.pending_bookings === 1 ? '' : 's'} awaiting confirmation`,
 link: '/bookings',
 type: 'booking' as const,
 }]
 : []),
 ];

 useEffect(() => {
 function handleClick(e: MouseEvent) {
 if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
 setNotifOpen(false);
 }
 }
 if (notifOpen) {
 document.addEventListener('mousedown', handleClick);
 return () => document.removeEventListener('mousedown', handleClick);
 }
 }, [notifOpen]);

 return (
 <div className="min-h-screen bg-surface flex text-text-primary">
 <aside
 className={`fixed inset-y-0 left-0 z-40 w-56 bg-surface-raised border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static ${
 mobileOpen ? 'translate-x-0' : '-translate-x-full'
 }`}
 >
 <div className="h-full flex flex-col">
 <div className="px-4 py-3 border-b border-border">
 <h1 className="text-sm font-semibold text-text-primary tracking-tight">
 AngkorWatDayTour
 </h1>
 <p className="text-[11px] text-text-muted mt-0.5">Admin Portal</p>
 </div>

 <nav className="flex-1 p-2 space-y-0.5">
 {NAV_ITEMS.map((item) => {
 const Icon = item.icon;
 return (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.to === '/'}
 onClick={() => setMobileOpen(false)}
 className={({ isActive }) =>
 `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
 isActive
 ? 'bg-surface-elevated text-text-primary'
 : 'text-text-secondary hover:bg-surface-elevated/50 hover:text-text-primary'
 }`
 }
 >
 <Icon className="w-4 h-4" />
 {item.label}
 </NavLink>
 );
 })}
 </nav>

 <div className="p-2 border-t border-border">
 <div className="flex items-center gap-2.5 px-3 py-1.5 mb-1">
 <div className="w-7 h-7 rounded-full bg-surface-elevated text-text-secondary flex items-center justify-center text-[11px] font-bold shrink-0 border border-border overflow-hidden">
 {user?.avatar_url ? (
 <img
 src={user.avatar_url}
 alt={user.name}
 className="w-full h-full object-cover"
 />
 ) : (
 user?.name?.charAt(0).toUpperCase() || 'A'
 )}
 </div>
 <div className="min-w-0">
 <p className="text-xs font-medium text-text-primary truncate">
 {user?.name ?? 'Admin'}
 </p>
 <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
 {user?.role && (
 <p className="text-[9px] uppercase tracking-wide text-text-muted font-semibold mt-0.5">
 {user.role.label || user.role.name}
 </p>
 )}
 </div>
 </div>
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
 >
 <LogOut className="w-4 h-4" />
 Sign out
 </button>
 </div>
 </div>
 </aside>

 {mobileOpen && (
 <div
 className="fixed inset-0 bg-black/50 z-30 lg:hidden"
 onClick={() => setMobileOpen(false)}
 />
 )}

 <div className="flex-1 min-w-0">
 <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur border-b border-border px-4 sm:px-4 py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <button
 onClick={() => setMobileOpen(true)}
 className="lg:hidden p-1.5 rounded-md hover:bg-surface-elevated text-text-secondary"
 >
 <Menu className="w-4 h-4" />
 </button>
 <div>
 <h2 className="text-sm font-semibold text-text-primary">{pageTitle}</h2>
 <p className="text-[11px] text-text-muted hidden sm:block">
 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={refreshData}
 className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-muted hover:bg-surface-elevated transition-colors"
 title="Refresh data"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 Refresh
 </button>
 <button
 onClick={toggleTheme}
 className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-muted hover:bg-surface-elevated transition-colors"
 title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
 </button>
 <div className="relative">
 <button
 ref={bellRef}
 onClick={() => setNotifOpen((v) => !v)}
 className="p-1.5 rounded-md text-text-muted hover:bg-surface-elevated relative"
 aria-label="Notifications"
 >
 <Bell className="w-4 h-4" />
 {pendingCount > 0 && (
 <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-error text-[9px] font-bold text-white border border-surface">
 {pendingCount > 9 ? '9+' : pendingCount}
 </span>
 )}
 </button>
 {notifOpen && (
 <div className="absolute right-0 mt-2 w-64 bg-surface-raised border border-border rounded-md overflow-hidden z-50 ">
 <div className="px-3 py-2 border-b border-border flex items-center justify-between">
 <span className="text-xs font-semibold text-text-primary">Notifications</span>
 {pendingCount > 0 && (
 <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary font-medium border border-border">
 {pendingCount}
 </span>
 )}
 </div>
 {notifications.length === 0 ? (
 <div className="px-3 py-4 text-center text-xs text-text-muted">No new notifications</div>
 ) : (
 <div className="max-h-80 overflow-y-auto">
 {notifications.map((n) => (
 <button
 key={n.id}
 onClick={() => {
 navigate(n.link);
 setNotifOpen(false);
 }}
 className="w-full text-left px-3 py-2 hover:bg-surface-elevated transition flex items-start gap-2.5"
 >
 <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${n.type === 'provider' ? 'bg-text-secondary' : 'bg-text-muted'}`} />
 <span className="text-xs text-text-primary">{n.message}</span>
 </button>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 <button
 onClick={handleLogout}
 className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
 >
 <LogOut className="w-3.5 h-3.5" /> Sign out
 </button>
 </div>
 </div>
 </header>

 <main className="p-4 sm:p-4">
 <Outlet />
 </main>
 </div>
 </div>
 );
}
