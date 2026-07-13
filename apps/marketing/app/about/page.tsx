import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About AngkorWatDayTour — Local Tours in Siem Reap",
  description:
    "AngkorWatDayTour connects travelers with verified local guides, drivers, and photographers in Siem Reap.",
};

export default function AboutPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6">About Us</h1>
          <div className="bg-card-white rounded-xl p-6 md:p-8 shadow-sm space-y-4 text-stone-gray">
            <p>
              AngkorWatDayTour is a marketplace that connects visitors to Siem Reap with verified local providers — from tuk-tuk drivers and private taxis to expert temple guides and photographers.
            </p>
            <p>
              Our mission is to make it easy for travelers to discover, compare, and book authentic Cambodian experiences while helping local providers grow their businesses.
            </p>
            <p>
              Every listing is reviewed, every booking is confirmed instantly, and every payment is handled securely through the AngkorWatDayTour app.
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
