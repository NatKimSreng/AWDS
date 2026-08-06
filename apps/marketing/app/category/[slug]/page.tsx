import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCategories, fetchActivities, fetchCities } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import TourFilters from "@/components/TourFilters";
import SectionHeading from "@/components/SectionHeading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { MapPin, ChevronRight, SlidersHorizontal, Tag, Search } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

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

interface City {
  id: number;
  name: string;
  slug: string;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const categories = (await fetchCategories()) as Category[];
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = (await fetchCategories()) as Category[];
  const category = categories.find((c) => c.slug === slug);

  return {
    title: category
      ? `${category.name} Tours in Cambodia — AngkorWatDayTour`
      : "Category — AngkorWatDayTour",
    description: category
      ? `Browse ${category.name.toLowerCase()} tours, guides, and experiences in Cambodia on AngkorWatDayTour.`
      : "Browse Cambodia tours and experiences by category.",
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const qParams = await searchParams;
  const categories = (await fetchCategories()) as Category[];
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const sort = typeof qParams.sort === "string" ? qParams.sort : "";
  const duration = typeof qParams.duration === "string" ? qParams.duration : "";
  const minPrice = typeof qParams.min_price === "string" ? qParams.min_price : "";
  const maxPrice = typeof qParams.max_price === "string" ? qParams.max_price : "";
  const instantBook = qParams.instant_book === "1" ? "1" : "";

  const apiParams: Record<string, string> = {
    category: slug,
    per_page: "24",
  };
  if (sort) apiParams.sort = sort;
  if (duration) apiParams.duration = duration;
  if (minPrice) apiParams.min_price = minPrice;
  if (maxPrice) apiParams.max_price = maxPrice;
  if (instantBook) apiParams.instant_book = instantBook;

  const activities = (await fetchActivities(apiParams)) as Activity[];
  const cities = (await fetchCities()) as City[];

  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      {/* Banner */}
      <section className="relative h-56 md:h-72">
        <Image
          src="/images/hero-angkor.jpg"
          alt={category.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gyg-navy/95 via-gyg-navy/80 to-gyg-blue/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
          <nav className="flex items-center gap-2 text-sm text-white/80 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/tours" className="hover:text-white">Tours</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{category.name}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
            {category.name} tours
          </h1>
          <p className="text-white/90 max-w-xl">
            Discover the best {category.name.toLowerCase()} experiences in Cambodia and beyond.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <FadeIn>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 z-20 bg-white rounded-2xl border border-gyg-border p-5 shadow-card">
                <div className="flex items-center gap-2 mb-5">
                  <SlidersHorizontal className="w-5 h-5 text-gyg-navy" />
                  <span className="font-bold text-gyg-navy">Filters</span>
                </div>

                <TourFilters />

                <div className="mt-6 pt-6 border-t border-gyg-border">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gyg-text">
                    <Tag className="w-4 h-4" /> Categories
                  </div>
                  <ul className="space-y-2">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/category/${cat.slug}`}
                          className={`text-sm ${cat.slug === slug ? "font-semibold text-gyg-navy" : "text-gyg-muted hover:text-gyg-navy"}`}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-gyg-border">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gyg-text">
                    <MapPin className="w-4 h-4" /> Destinations
                  </div>
                  <ul className="space-y-2">
                    {cities.map((city) => (
                      <li key={city.id}>
                        <Link
                          href={`/tours?city=${city.slug}`}
                          className="text-sm text-gyg-muted hover:text-gyg-navy"
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
            <div className="flex-1 min-w-0">
              <TourFilters />

              <div className="mt-6">
                {activities.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gyg-border p-12 text-center">
                    <Search className="w-12 h-12 text-gyg-muted mx-auto mb-4" />
                    <p className="text-gyg-muted">
                      No {category.name.toLowerCase()} tours match your filters right now.
                    </p>
                    <Link
                      href={`/category/${category.slug}`}
                      className="inline-block mt-4 text-gyg-navy font-semibold hover:underline"
                    >
                      Clear filters
                    </Link>
                  </div>
                ) : (
                  <>
                    <SectionHeading
                      title={`${activities.length} ${activities.length === 1 ? "experience" : "experiences"}`}
                      subtitle={`Top ${category.name.toLowerCase()} tours in Cambodia`}
                    />
                    <StaggerContainer className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {activities.map((activity) => (
                        <StaggerItem key={activity.id}>
                          <TourCard {...activity} />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
