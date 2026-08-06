"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Globe,
  ChevronDown,
  User,
  Heart,
  LogOut,
  CalendarDays,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/lib/authApi";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-full hover:bg-gyg-bg text-gyg-text transition"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    clearAuth();
    setAccountOpen(false);
  };

  return (
    <header className="sticky top-0 z-[90] bg-background/95 backdrop-blur-md border-b border-gyg-border/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-extrabold text-gyg-navy tracking-tight shrink-0"
        >
          AngkorWatDayTour
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-2xl px-6">
          <form action="/tours" className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
            <input
              type="text"
              name="q"
              placeholder="Search destinations, tours, or activities..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gyg-border bg-gyg-bg text-sm focus:bg-background focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition shadow-soft text-foreground"
            />
          </form>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gyg-text">
          <Link href="/tours" className="hover:text-gyg-navy transition">
            Destinations
          </Link>
          <Link href="/tours" className="hover:text-gyg-navy transition">
            Things to do
          </Link>
          <Link href="/vendors" className="hover:text-gyg-navy transition">
            Local guides
          </Link>
          <Link href="/blog" className="hover:text-gyg-navy transition">
            Travel Guide
          </Link>
          <button className="hidden xl:flex items-center gap-1 text-gyg-muted hover:text-gyg-text">
            <Globe className="w-4 h-4" />
            <span>EN</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <ThemeToggle />

          {mounted && isAuthenticated() ? (
            <>
              <Link
                href="/wishlist"
                className="p-2 rounded-full hover:bg-gyg-bg text-gyg-text transition"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((s) => !s)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gyg-border hover:border-gyg-navy bg-background transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gyg-navy text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <ChevronDown className={`w-3 h-3 text-gyg-muted transition ${accountOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-background rounded-2xl border border-gyg-border shadow-card py-2 z-[95]"
                    >
                      <div className="px-4 py-3 border-b border-gyg-border">
                        <div className="font-semibold text-gyg-text truncate">{user?.name}</div>
                        <div className="text-xs text-gyg-muted truncate">{user?.email}</div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gyg-text hover:bg-gyg-bg transition"
                        onClick={() => setAccountOpen(false)}
                      >
                        <User className="w-4 h-4 text-gyg-muted" /> Profile
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gyg-text hover:bg-gyg-bg transition"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Heart className="w-4 h-4 text-gyg-muted" /> Wishlist
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gyg-text hover:bg-gyg-bg transition"
                        onClick={() => setAccountOpen(false)}
                      >
                        <CalendarDays className="w-4 h-4 text-gyg-muted" /> Bookings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gyg-text hover:text-gyg-navy transition font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/become-a-provider"
                className="px-4 py-2 rounded-full bg-gyg-navy text-white hover:bg-black transition font-medium"
              >
                List your tour
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gyg-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-gyg-border bg-background"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
              <form action="/tours" className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search experiences..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-sm outline-none text-foreground"
                />
              </form>
              <div className="flex flex-col gap-1 text-base font-medium text-gyg-text">
                <Link href="/tours" className="py-2.5 hover:text-gyg-navy" onClick={() => setMobileOpen(false)}>
                  Destinations
                </Link>
                <Link href="/tours" className="py-2.5 hover:text-gyg-navy" onClick={() => setMobileOpen(false)}>
                  Things to do
                </Link>
                <Link href="/vendors" className="py-2.5 hover:text-gyg-navy" onClick={() => setMobileOpen(false)}>
                  Local guides
                </Link>
                <Link href="/blog" className="py-2.5 hover:text-gyg-navy" onClick={() => setMobileOpen(false)}>
                  Travel Guide
                </Link>
                {mounted && isAuthenticated() ? (
                  <>
                    <Link href="/wishlist" className="py-2.5 hover:text-gyg-navy" onClick={() => setMobileOpen(false)}>
                      Wishlist
                    </Link>
                    <Link href="/profile" className="py-2.5 hover:text-gyg-navy" onClick={() => setMobileOpen(false)}>
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="py-2.5 text-left text-red-600"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="py-2.5 text-gyg-navy" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                )}
                <Link
                  href="/become-a-provider"
                  className="mt-2 py-2.5 text-center rounded-xl bg-gyg-navy text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  List your tour
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
