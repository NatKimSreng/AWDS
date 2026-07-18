"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Globe, ChevronDown } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gyg-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-angkor-orange tracking-tight shrink-0"
        >
          AngkorWatDayTour
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <form action="/tours" className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
            <input
              type="text"
              name="q"
              placeholder="Search destinations, tours, or activities..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gyg-border bg-gyg-bg text-sm focus:bg-white focus:border-angkor-orange focus:ring-2 focus:ring-angkor-orange/20 outline-none transition"
            />
          </form>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gyg-text">
          <Link href="/tours" className="hover:text-angkor-orange transition">
            Destinations
          </Link>
          <Link href="/tours" className="hover:text-angkor-orange transition">
            Things to do
          </Link>
          <Link href="/blog" className="hover:text-angkor-orange transition">
            Travel Guide
          </Link>
          <button className="hidden xl:flex items-center gap-1 text-gyg-muted hover:text-gyg-text">
            <Globe className="w-4 h-4" />
            <span>EN</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <Link
            href="/become-a-provider"
            className="px-4 py-2 rounded-full border border-angkor-orange text-angkor-orange hover:bg-angkor-orange-light transition"
          >
            List your tour
          </Link>
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
      {mobileOpen && (
        <div className="md:hidden border-t border-gyg-border bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <form action="/tours" className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
              <input
                type="text"
                name="q"
                placeholder="Search experiences..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gyg-border bg-gyg-bg text-sm outline-none"
              />
            </form>
            <div className="flex flex-col gap-2 text-sm font-medium text-gyg-text">
              <Link href="/tours" className="py-2 hover:text-angkor-orange" onClick={() => setMobileOpen(false)}>
                Destinations
              </Link>
              <Link href="/tours" className="py-2 hover:text-angkor-orange" onClick={() => setMobileOpen(false)}>
                Things to do
              </Link>
              <Link href="/blog" className="py-2 hover:text-angkor-orange" onClick={() => setMobileOpen(false)}>
                Travel Guide
              </Link>
              <Link
                href="/become-a-provider"
                className="py-2 text-angkor-orange"
                onClick={() => setMobileOpen(false)}
              >
                List your tour
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
