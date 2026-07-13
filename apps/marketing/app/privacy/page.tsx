import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — AngkorWatDayTour",
  description: "How AngkorWatDayTour collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1">
      <header className="bg-card-white border-b border-stone-gray/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-angkor-orange font-heading"
          >
            AngkorWatDayTour
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-stone-gray">
            <Link href="/tours" className="hover:text-angkor-orange">
              Tours
            </Link>
            <Link href="/blog" className="hover:text-angkor-orange">
              Travel Guide
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-sand-bg py-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
          <div className="bg-card-white rounded-xl p-6 md:p-8 shadow-sm space-y-4 text-stone-gray">
            <p>
              AngkorWatDayTour respects your privacy. This policy explains what information we collect, how we use it, and how we keep it safe.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">Information we collect</h2>
            <p>
              We collect account information (name, email, phone), booking details, payment information processed by our payment partners, and device/app usage data to improve our services.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">How we use your information</h2>
            <p>
              Your information is used to process bookings, communicate with providers and travelers, prevent fraud, and send important service updates.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">Data security</h2>
            <p>
              We use encryption, access controls, and secure hosting to protect your data. We do not sell personal information to third parties.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-card-white border-t border-stone-gray/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-gray">
          <span>© {new Date().getFullYear()} AngkorWatDayTour.com</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-angkor-orange">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-angkor-orange">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
