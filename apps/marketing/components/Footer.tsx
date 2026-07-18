"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gyg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top row: brand + newsletter */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 pb-10 border-b border-white/10">
          <div className="max-w-sm">
            <span className="text-2xl font-bold text-angkor-orange">
              AngkorWatDayTour
            </span>
            <p className="mt-3 text-sm text-gray-300">
              Book verified local tours, guides, transport, and photographers in Siem Reap.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-300">
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

          <div className="max-w-md">
            <h4 className="font-semibold mb-3">Get travel tips &amp; deals</h4>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 outline-none focus:border-angkor-orange"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-angkor-orange hover:bg-angkor-orange-dark font-semibold transition"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">
              We send inspiration only — no spam.
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-white/10">
          <div>
            <h4 className="font-semibold mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/tours" className="hover:text-white transition">All tours</Link>
              </li>
              <li>
                <Link href="/category/temples-history" className="hover:text-white transition">Temples &amp; History</Link>
              </li>
              <li>
                <Link href="/category/sunrise-sunset" className="hover:text-white transition">Sunrise &amp; Sunset</Link>
              </li>
              <li>
                <Link href="/category/food-culture" className="hover:text-white transition">Food &amp; Culture</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-white transition">About us</Link>
              </li>
              <li>
                <Link href="/become-a-provider" className="hover:text-white transition">Become a provider</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">Travel guide</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/help" className="hover:text-white transition">Help Center</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/cancellation" className="hover:text-white transition">Cancellation Policy</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Get the app</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.angkorwatdaytour.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-white text-gyg-navy px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 transition"
              >
                Google Play
              </a>
              <a
                href="https://apps.apple.com/app/angkorwatdaytour/id0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-white text-white px-4 py-2.5 text-sm font-semibold hover:bg-white/10 transition"
              >
                App Store
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} AngkorWatDayTour.com</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/cancellation" className="hover:text-white transition">Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
