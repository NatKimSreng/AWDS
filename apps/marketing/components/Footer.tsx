"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FadeIn } from "./MotionWrapper";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gyg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Newsletter */}
        <FadeIn className="py-12 border-b border-gyg-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-gyg-navy mb-2">Get travel tips &amp; deals</h3>
              <p className="text-sm text-gyg-muted">
                Inspiration for your next Cambodia adventure — no spam, ever.
              </p>
            </div>
            <form className="flex gap-2 w-full lg:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 lg:w-72 px-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted outline-none focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 transition"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gyg-navy hover:bg-black text-white font-semibold transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </FadeIn>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-gyg-navy tracking-tight">
              AngkorWatDayTour
            </Link>
            <p className="mt-3 text-sm text-gyg-muted leading-relaxed">
              Verified local tours, guides, transport, and photographers in Siem Reap.
            </p>
            <div className="mt-4 flex flex-col gap-1.5 text-sm text-gyg-muted">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Siem Reap, Cambodia
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> hello@angkorwatdaytour.com
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +855 12 345 678
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gyg-text mb-4">Discover</h4>
            <ul className="space-y-3 text-sm text-gyg-muted">
              <li><Link href="/tours" className="hover:text-gyg-navy transition">All tours</Link></li>
              <li><Link href="/category/temples-history" className="hover:text-gyg-navy transition">Temples &amp; History</Link></li>
              <li><Link href="/category/sunrise-sunset" className="hover:text-gyg-navy transition">Sunrise &amp; Sunset</Link></li>
              <li><Link href="/category/food-culture" className="hover:text-gyg-navy transition">Food &amp; Culture</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gyg-text mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gyg-muted">
              <li><Link href="/about" className="hover:text-gyg-navy transition">About us</Link></li>
              <li><Link href="/become-a-provider" className="hover:text-gyg-navy transition">Become a provider</Link></li>
              <li><Link href="/blog" className="hover:text-gyg-navy transition">Travel guide</Link></li>
              <li><Link href="/contact" className="hover:text-gyg-navy transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gyg-text mb-4">Get the app</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.angkorwatdaytour.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-gyg-navy text-white px-4 py-2.5 text-sm font-semibold hover:bg-black transition"
              >
                Google Play
              </a>
              <a
                href="https://apps.apple.com/app/angkorwatdaytour/id0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-gyg-border text-gyg-text px-4 py-2.5 text-sm font-semibold hover:border-gyg-navy hover:text-gyg-navy transition"
              >
                App Store
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" aria-label="Facebook" className="text-gyg-muted hover:text-gyg-navy transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-gyg-muted hover:text-gyg-navy transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                </svg>
              </a>
              <a href="#" aria-label="X" className="text-gyg-muted hover:text-gyg-navy transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l12.966 15.644Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-gyg-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gyg-muted">
          <span>© {year} AngkorWatDayTour.com</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gyg-text transition">Terms</Link>
            <Link href="/privacy" className="hover:text-gyg-text transition">Privacy</Link>
            <Link href="/cancellation" className="hover:text-gyg-text transition">Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
