import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Become a Provider — AngkorWatDayTour",
  description: "List your tours, transport, or guide services on AngkorWatDayTour and reach more travelers in Siem Reap.",
};

export default function BecomeAProviderPage() {
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
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Grow your tour business with AngkorWatDayTour
          </h1>
          <p className="text-stone-gray text-center mb-12 max-w-2xl mx-auto">
            Join local guides, drivers, photographers, and tour operators who use our platform to manage bookings, receive secure payments, and reach travelers from around the world.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: "More Bookings", body: "Get discovered by travelers searching for tours in Siem Reap." },
              { title: "Easy Scheduling", body: "Set your availability, capacity, and blackout dates in one place." },
              { title: "Secure Payouts", body: "Receive payouts to your bank or ABA account on a schedule you choose." },
            ].map((item) => (
              <div key={item.title} className="bg-card-white rounded-xl p-6 shadow-sm text-center">
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-stone-gray">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-card-white rounded-xl p-6 md:p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to apply?</h2>
            <p className="text-stone-gray mb-6">
              Download the AngkorWatDayTour app and start the provider onboarding flow, or email us for partnership questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:partners@angkorwatdaytour.com"
                className="inline-flex items-center justify-center rounded-lg bg-angkor-orange text-white px-6 py-3 font-medium hover:bg-angkor-orange-dark transition"
              >
                Email Partnership Team
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-stone-gray/30 text-stone-charcoal px-6 py-3 font-medium hover:bg-stone-gray/10 transition"
              >
                Contact Us
              </Link>
            </div>
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
