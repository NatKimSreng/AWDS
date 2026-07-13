import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCategories, fetchActivities } from "@/lib/api";

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
  avg_rating: number;
  reviews_count: number;
  city: { name: string; slug: string } | null;
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
      ? `${category.name} Tours in Siem Reap — AngkorWatDayTour`
      : "Category — AngkorWatDayTour",
    description: category
      ? `Browse ${category.name.toLowerCase()} tours, guides, and experiences in Siem Reap on AngkorWatDayTour.`
      : "Browse Siem Reap tours and experiences by category.",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = (await fetchCategories()) as Category[];
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const activities = (await fetchActivities({
    category: slug,
    per_page: "20",
  })) as Activity[];

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
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {category.name} Tours
          </h1>

          {activities.length === 0 ? (
            <p className="text-stone-gray">
              No {category.name.toLowerCase()} tours available right now.
            </p>
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
                      {category.name} · {activity.city?.name}
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
          </div>
        </div>
      </footer>
    </div>
  );
}
