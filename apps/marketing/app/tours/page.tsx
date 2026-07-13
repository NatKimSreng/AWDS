import type { Metadata } from "next";
import Link from "next/link";
import { fetchActivities, fetchCategories, fetchCities } from "@/lib/api";

export const metadata: Metadata = {
  title: "Tours in Siem Reap — AngkorWatDayTour",
  description:
    "Browse sunrise Angkor Wat tours, local guides, transport, photography, and multi-day experiences in Siem Reap.",
};

interface Activity {
  id: number;
  slug: string;
  title: string;
  base_price_usd: string;
  duration_minutes: number;
  avg_rating: number;
  reviews_count: number;
  category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface City {
  id: number;
  name: string;
  slug: string;
}

export default async function ToursPage() {
  const activities = (await fetchActivities({ per_page: "20" })) as Activity[];
  const categories = (await fetchCategories()) as Category[];
  const cities = (await fetchCities()) as City[];

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
            <Link href="/tours" className="text-angkor-orange font-medium">
              Tours
            </Link>
            <Link href="/blog" className="hover:text-angkor-orange">
              Travel Guide
            </Link>
            <Link href="/become-a-provider" className="hover:text-angkor-orange">
              Become a Provider
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-sand-bg py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Siem Reap Tours & Experiences</h1>

          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-sm text-stone-gray py-2">Filter by category:</span>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-sm px-3 py-2 rounded-full bg-card-white text-stone-charcoal hover:bg-angkor-orange hover:text-white transition"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <span className="text-sm text-stone-gray py-2">Destinations:</span>
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/tours?city=${city.slug}`}
                className="text-sm px-3 py-2 rounded-full bg-card-white text-stone-charcoal hover:bg-angkor-orange hover:text-white transition"
              >
                {city.name}
              </Link>
            ))}
          </div>

          {activities.length === 0 ? (
            <p className="text-stone-gray">No tours available right now.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/tours/${activity.slug}`}
                  className="group bg-card-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="h-48 bg-stone-gray/20" />
                  <div className="p-5">
                    <div className="text-xs text-stone-gray mb-2">
                      {activity.category?.name} · {activity.city?.name}
                    </div>
                    <h2 className="text-lg font-semibold mb-2 group-hover:text-angkor-orange transition">
                      {activity.title}
                    </h2>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-gray">
                        {Math.round(activity.duration_minutes / 60)}h
                      </span>
                      <span className="text-stone-gray">
                        ★ {activity.avg_rating} ({activity.reviews_count})
                      </span>
                      <span className="text-angkor-orange font-semibold">
                        ${activity.base_price_usd}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
            <Link href="/cancellation" className="hover:text-angkor-orange">
              Cancellation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
