import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="bg-card-white border-b border-stone-gray/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-angkor-orange font-heading">
            AngkorWatDayTour
          </span>
          <nav className="hidden md:flex gap-6 text-sm text-stone-gray">
            <Link href="/tours" className="hover:text-angkor-orange">Tours</Link>
            <Link href="/tours" className="hover:text-angkor-orange">Tours</Link>
            <Link href="/blog" className="hover:text-angkor-orange">Travel Guide</Link>
            <Link href="/about" className="hover:text-angkor-orange">About</Link>
            <Link href="/contact" className="hover:text-angkor-orange">Contact</Link>
            <Link href="/become-a-provider" className="hover:text-angkor-orange">Become a Provider</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative bg-stone-charcoal text-white py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Siem Reap’s Best Local Experiences
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Sunrise Angkor Wat tours, trusted tuktuk drivers, private taxis,
              expert guides, and photographers — all in one app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://play.google.com/store/apps/details?id=com.angkorwatdaytour.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-angkor-orange px-6 py-3 font-medium hover:bg-angkor-orange-dark transition"
              >
                Get it on Google Play
              </a>
              <a
                href="https://apps.apple.com/app/angkorwatdaytour/id0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-white text-stone-charcoal px-6 py-3 font-medium hover:bg-gray-100 transition"
              >
                Download on the App Store
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-sand-bg">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why book with AngkorWatDayTour?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Verified Local Providers", body: "Every guide, driver, and photographer is reviewed and verified." },
                { title: "Instant Booking", body: "Check real-time availability and confirm your slot in seconds." },
                { title: "Secure Payments", body: "Pay with Bakong KHQR or Visa/Mastercard — priced in USD & KHR." },
              ].map((item) => (
                <div key={item.title} className="bg-card-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-stone-gray">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card-white border-t border-stone-gray/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-gray">
          <span>© {new Date().getFullYear()} AngkorWatDayTour.com</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-angkor-orange">Terms</Link>
            <Link href="/privacy" className="hover:text-angkor-orange">Privacy</Link>
            <Link href="/cancellation" className="hover:text-angkor-orange">Cancellation Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
