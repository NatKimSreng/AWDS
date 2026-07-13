import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchActivities, fetchActivity } from "@/lib/api";

interface ItineraryItem {
  time: string;
  description: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  author: string;
  created_at: string;
}

interface ActivityDetail {
  title: string;
  slug: string;
  description: string;
  itinerary: ItineraryItem[];
  inclusions: string;
  exclusions: string;
  meeting_point: { address: string } | null;
  duration_minutes: number;
  max_group: number;
  base_price_usd: string;
  spoken_languages: string[];
  avg_rating: number;
  reviews_count: number;
  category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
  provider: { business_name: string; bio: string } | null;
  gallery: string[];
  reviews: Review[];
}

interface ActivityListItem {
  slug: string;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const activities = (await fetchActivities({ per_page: "100" })) as ActivityListItem[];
  return activities.map((activity) => ({ slug: activity.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const activity = (await fetchActivity(slug)) as ActivityDetail | null;

  return {
    title: activity?.title
      ? `${activity.title} — AngkorWatDayTour`
      : "Tour — AngkorWatDayTour",
    description: activity?.description
      ? `${activity.description.slice(0, 155)}...`
      : "Book this tour in Siem Reap on AngkorWatDayTour.",
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const activity = (await fetchActivity(slug)) as ActivityDetail | null;

  if (!activity) {
    notFound();
  }

  const durationHours = Math.round(activity.duration_minutes / 60);
  const languages = activity.spoken_languages?.join(", ").toUpperCase() ?? "EN";

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
          <Link
            href="/tours"
            className="text-sm text-stone-gray hover:text-angkor-orange mb-4 inline-block"
          >
            ← Back to tours
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {activity.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-gray mb-8">
            <span>
              {activity.category?.name} · {activity.city?.name}
            </span>
            <span>★ {activity.avg_rating} ({activity.reviews_count} reviews)</span>
            <span>{durationHours} hours</span>
            <span>Max {activity.max_group} travelers</span>
          </div>

          <div className="h-72 md:h-96 bg-stone-gray/20 rounded-2xl mb-8" />

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-8">
              <section className="bg-card-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-3">About this tour</h2>
                <p className="text-stone-gray leading-relaxed whitespace-pre-line">
                  {activity.description}
                </p>
              </section>

              {activity.itinerary?.length > 0 && (
                <section className="bg-card-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
                  <div className="space-y-4">
                    {activity.itinerary.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <span className="font-semibold text-angkor-orange w-16 shrink-0">
                          {item.time}
                        </span>
                        <span className="text-stone-gray">
                          {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activity.inclusions && (
                <section className="bg-card-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-3">Inclusions</h2>
                  <p className="text-stone-gray whitespace-pre-line">
                    {activity.inclusions}
                  </p>
                </section>
              )}

              {activity.exclusions && (
                <section className="bg-card-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-3">Exclusions</h2>
                  <p className="text-stone-gray whitespace-pre-line">
                    {activity.exclusions}
                  </p>
                </section>
              )}

              <section className="bg-card-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-3">Meeting point</h2>
                <p className="text-stone-gray">
                  {activity.meeting_point?.address ?? "To be confirmed after booking."}
                </p>
              </section>

              {activity.reviews?.length > 0 && (
                <section className="bg-card-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Recent reviews</h2>
                  <div className="space-y-4">
                    {activity.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-stone-gray/10 last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {review.author}
                          </span>
                          <span className="text-khmer-gold text-sm">
                            ★ {review.rating}
                          </span>
                        </div>
                        <p className="text-stone-gray text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="lg:sticky lg:top-6 h-fit">
              <div className="bg-card-white rounded-xl p-6 shadow-sm">
                <div className="text-sm text-stone-gray mb-1">From</div>
                <div className="text-3xl font-bold text-angkor-orange mb-4">
                  ${activity.base_price_usd}
                </div>

                <div className="space-y-3 text-sm text-stone-gray mb-6">
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>{durationHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Group size</span>
                    <span>Up to {activity.max_group}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages</span>
                    <span>{languages}</span>
                  </div>
                </div>

                <a
                  href={`https://play.google.com/store/apps/details?id=com.angkorwatdaytour.app`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-lg bg-angkor-orange text-white px-6 py-3 font-medium hover:bg-angkor-orange-dark transition"
                >
                  Book in the app
                </a>
                <p className="text-xs text-stone-gray text-center mt-3">
                  Download the AngkorWatDayTour app to check live availability and
                  complete your booking.
                </p>
              </div>

              {activity.provider && (
                <div className="bg-card-white rounded-xl p-6 shadow-sm mt-4">
                  <h3 className="font-bold mb-1">
                    {activity.provider.business_name}
                  </h3>
                  <p className="text-sm text-stone-gray">
                    {activity.provider.bio}
                  </p>
                </div>
              )}
            </aside>
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
