import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact AngkorWatDayTour",
  description: "Get in touch with the AngkorWatDayTour team for support, partnerships, or media inquiries.",
};

export default function ContactPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
          <div className="bg-card-white rounded-xl p-6 md:p-8 shadow-sm space-y-4 text-stone-gray">
            <p>
              Have a question, partnership idea, or need help with a booking? Reach out to us anytime.
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:hello@angkorwatdaytour.com"
                  className="text-angkor-orange hover:underline"
                >
                  hello@angkorwatdaytour.com
                </a>
              </li>
              <li>
                <strong>Support hours:</strong> 8:00 AM – 8:00 PM (ICT), 7 days a week
              </li>
              <li>
                <strong>Office:</strong> Siem Reap, Cambodia
              </li>
            </ul>
            <p>
              For booking support, you can also use the help section inside the mobile app.
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
