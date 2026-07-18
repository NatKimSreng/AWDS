import Link from "next/link";
import type { Metadata } from "next";
import { fetchActivities, fetchCategories, fetchCities } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import TourFilters from "@/components/TourFilters";
import { Search, SlidersHorizontal, MapPin, Tag, ChevronRight } from "lucide-react";

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
  min_group: number;
  max_group: number;
  avg_rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_instant_book: boolean;
  category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
  provider: { business_name: string } | null;
  hero_image: string | null;
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

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const categorySlug = typeof params.category === "string" ? params.category : "";
  const citySlug = typeof params.city === "string" ? params.city : "";
  const sort = typeof params.sort === "string" ? params.sort : "";
  const duration = typeof params.duration === "string" ? params.duration : "";
  const minPrice = typeof params.min_price === "string" ? params.min_price : "";
  const maxPrice = typeof params.max_price === "string" ? params.max_price : "";
  const instantBook = params.instant_book === "1" ? "1" : "";

  const apiParams: Record<string, string> = { per_page: "24" };
  if (query) apiParams.query = query;
  if (categorySlug) apiParams.category = categorySlug;
  if (citySlug) apiParams.city = citySlug;
  if (sort) apiParams.sort = sort;
  if (duration) apiParams.duration = duration;
  if (minPrice) apiParams.min_price = minPrice;
  if (maxPrice) apiParams.max_price = maxPrice;
  if (instantBook) apiParams.instant_book = instantBook;

  const activities = (await fetchActivities(apiParams)) as Activity[];
  const categories = (await fetchCategories()) as Category[];
  const cities = (await fetchCities()) as City[];

  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      {/* Sub-hero */}
      <section className="bg-white border-b border-gyg-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-gyg-muted mb-3">
            <Link href="/" className="hover:text-angkor-orange">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gyg-text font-medium">Tours</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gyg-navy mb-2">
            {query ? `Results for "${query}"` : "Siem Reap tours &amp; experiences"}
          </h1>
          <p className="text-gyg-muted">
            {activities.length} {activities.length === 1 ? "experience" : "experiences"} available
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gyg-border p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal className="w-5 h-5 text-angkor-orange" />
                <span className="font-bold text-gyg-navy">Filters</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gyg-text">
                  <Tag className="w-4 h-4" /> Categories
                </div>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/tours"
                      className={`text-sm ${!categorySlug ? "font-semibold text-angkor-orange" : "text-gyg-muted hover:text-angkor-orange"}`}
                    >
                      All categories
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className={`text-sm ${categorySlug === category.slug ? "font-semibold text-angkor-orange" : "text-gyg-muted hover:text-angkor-orange"}`}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gyg-text">
                  <MapPin className="w-4 h-4" /> Destinations
                </div>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/tours"
                      className={`text-sm ${!citySlug ? "font-semibold text-angkor-orange" : "text-gyg-muted hover:text-angkor-orange"}`}
                    >
                      All destinations
                    </Link>
                  </li>
                  {cities.map((city) => (
                    <li key={city.id}>
                      <Link
                        href={`/tours?city=${city.slug}`}
                        className={`text-sm ${citySlug === city.slug ? "font-semibold text-angkor-orange" : "text-gyg-muted hover:text-angkor-orange"}`}
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <TourFilters />

            <div className="mt-6">
              {activities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gyg-border p-12 text-center">
                  <Search className="w-12 h-12 text-gyg-muted mx-auto mb-4" />
                  <p className="text-gyg-muted">No tours match your search.</p>
                  <Link
                    href="/tours"
                    className="inline-block mt-4 text-angkor-orange font-semibold hover:underline"
                  >
                    Clear filters
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activities.map((activity) => (
                    <TourCard key={activity.id} {...activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
