import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — AngkorWatDayTour",
  description: "Terms and conditions for using the AngkorWatDayTour platform.",
};

export default function TermsPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
          <div className="bg-card-white rounded-xl p-6 md:p-8 shadow-sm space-y-4 text-stone-gray">
            <p>
              By accessing or using AngkorWatDayTour, you agree to be bound by these terms. If you do not agree, please do not use the platform.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">Bookings</h2>
            <p>
              All bookings are made directly with the provider. AngkorWatDayTour facilitates payment, scheduling, and communication but is not the operator of the listed tours or services.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">Cancellations</h2>
            <p>
              Cancellation policies are set by each provider and shown at checkout. Refunds, if applicable, are issued according to the selected provider’s policy.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">Liability</h2>
            <p>
              AngkorWatDayTour is not liable for incidents that occur during a booked experience. Travelers and providers agree to resolve disputes in good faith.
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
