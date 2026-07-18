import { useState } from 'react';
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
} from 'lucide-react';

import { useAuthStore } from '../stores/authStore';

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
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const pageTitle = NAV_ITEMS.find((item) => item.to === location.pathname)?.label ?? 'Admin';

  return (
    <div className="min-h-screen bg-sand-bg flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card-white border-r border-stone-gray/10 transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-stone-gray/10">
            <h1 className="text-xl font-bold text-angkor-orange font-heading">
              AngkorWatDayTour
            </h1>
            <p className="text-xs text-stone-gray mt-1">Admin Portal</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-angkor-orange text-white'
                        : 'text-stone-gray hover:bg-stone-gray/5 hover:text-stone-charcoal'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-stone-gray/10">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-stone-charcoal truncate">
                {user?.name ?? 'Admin'}
              </p>
              <p className="text-xs text-stone-gray truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error-red hover:bg-error-red/5 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-charcoal/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-sand-bg/90 backdrop-blur border-b border-stone-gray/10 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-stone-gray/10 text-stone-charcoal"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-stone-charcoal">{pageTitle}</h2>
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 text-sm text-stone-gray hover:text-error-red transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
