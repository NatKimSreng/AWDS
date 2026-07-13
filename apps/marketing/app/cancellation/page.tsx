import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation Policy — AngkorWatDayTour",
  description: "Understand cancellation and refund policies for bookings on AngkorWatDayTour.",
};

export default function CancellationPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Cancellation Policy</h1>
          <div className="bg-card-white rounded-xl p-6 md:p-8 shadow-sm space-y-4 text-stone-gray">
            <p>
              Cancellation and refund rules are set by each provider and are shown clearly during checkout before you confirm a booking.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">Standard policy</h2>
            <p>
              Most providers offer a full refund when a cancellation is made at least 24 hours before the scheduled start time. Cancellations made within 24 hours may be non-refundable or partially refunded.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">No-shows</h2>
            <p>
              If you do not arrive at the meeting point within a reasonable grace period and have not contacted the provider, the booking is considered a no-show and is typically not refundable.
            </p>
            <h2 className="text-xl font-semibold text-stone-charcoal">Provider cancellations</h2>
            <p>
              If a provider cancels your booking, you will receive a full refund or the option to reschedule, depending on your preference.
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
