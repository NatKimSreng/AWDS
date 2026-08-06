import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
 LayoutDashboard,
 List,
 CalendarDays,
 CalendarCheck,
 Wallet,
 Settings,
 Menu,
 LogOut,
 ChevronRight,
 Sun,
 Moon,
} from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const NAV_ITEMS = [
 { to: '/', label: 'Dashboard', icon: LayoutDashboard },
 { to: '/listings', label: 'Listings', icon: List },
 { to: '/calendar', label: 'Calendar', icon: CalendarDays },
 { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
 { to: '/earnings', label: 'Earnings', icon: Wallet },
 { to: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
 const [mobileOpen, setMobileOpen] = useState(false);
 const user = useAuthStore((state) => state.user);
 const clearAuth = useAuthStore((state) => state.clearAuth);
 const navigate = useNavigate();
 const location = useLocation();
 const { theme, toggleTheme } = useThemeStore();

 const handleLogout = () => {
 clearAuth();
 navigate('/login');
 };

 const pageTitle =
 NAV_ITEMS.find((item) => item.to === location.pathname)?.label ??
 (location.pathname.startsWith('/listings/') ? 'Listing' : 'Dashboard');

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
 <p className="text-[11px] text-text-muted mt-0.5">Vendor Portal</p>
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
 <div className="w-7 h-7 rounded-full bg-surface-elevated text-text-secondary flex items-center justify-center text-[11px] font-bold shrink-0 border border-border">
 {user?.avatar_url ? (
 <img
 src={user.avatar_url}
 alt={user.name}
 className="w-full h-full rounded-full object-cover"
 />
 ) : (
 user?.name?.charAt(0).toUpperCase() || 'P'
 )}
 </div>
 <div className="min-w-0">
 <p className="text-xs font-medium text-text-primary truncate">
 {user?.name ?? 'Provider'}
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
 <div className="flex items-center gap-2 text-xs text-text-muted">
 <span className="hidden sm:inline">Vendor Portal</span>
 <ChevronRight className="w-3 h-3 hidden sm:block" />
 <span className="font-medium text-text-primary">{pageTitle}</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={toggleTheme}
 className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-muted hover:bg-surface-elevated transition-colors"
 title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
 </button>
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
