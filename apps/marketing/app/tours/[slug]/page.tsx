import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchActivities, fetchActivity } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import TourGallery from "@/components/TourGallery";
import BookingSection from "@/components/BookingSection";
import ReviewSummary from "@/components/ReviewSummary";
import ReviewList from "@/components/ReviewList";
import MapEmbed from "@/components/MapEmbed";
import SectionHeading from "@/components/SectionHeading";
import TourCard from "@/components/TourCard";
import {
  Clock,
  Users,
  MapPin,
  Globe,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  Star,
  Heart,
  Share2,
  Phone,
  BadgeCheck,
  Info,
  Backpack,
  Ban,
  AlertTriangle,
  Sun,
  CloudRain,
  CalendarX,
  Check,
} from "lucide-react";

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
  id: number;
  title: string;
  slug: string;
  description: string;
  itinerary: ItineraryItem[];
  inclusions: string;
  exclusions: string;
  what_to_bring?: string;
  not_allowed?: string;
  know_before_you_go?: string;
  additional_info?: string;
  not_suitable_for?: string;
  weather_policy?: string;
  start_time_flexibility?: string;
  is_refundable?: boolean;
  free_cancellation_hours?: number;
  meeting_point: { address: string; lat?: number; lng?: number } | null;
  duration_minutes: number;
  min_group: number;
  max_group: number;
  base_price_usd: string;
  spoken_languages: string[];
  is_instant_book: boolean;
  is_featured: boolean;
  avg_rating: number;
  reviews_count: number;
  category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
  provider: {
    id: number;
    business_name: string;
    bio: string;
    avg_rating: number;
    total_bookings: number;
  } | null;
  hero_image: string | null;
  gallery: string[];
  reviews: Review[];
}

interface ActivityListItem {
  slug: string;
}

interface SimilarActivity {
  id: number;
  slug: string;
  title: string;
  base_price_usd: string;
  duration_minutes: number;
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
    openGraph: activity?.hero_image
      ? {
          images: [{ url: activity.hero_image }],
        }
      : undefined,
  };
}

function splitList(value?: string | null): string[] {
  if (!value) return [];
  return value.split("\n").map((s) => s.trim()).filter(Boolean);
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
  const images = [activity.hero_image, ...(activity.gallery ?? [])].filter(Boolean) as string[];

  const similarParams: Record<string, string> = { per_page: "5" };
  if (activity.category?.slug) similarParams.category = activity.category.slug;
  else if (activity.city?.slug) similarParams.city = activity.city.slug;
  const similarAll = (await fetchActivities(similarParams)) as SimilarActivity[];
  const similarTours = similarAll.filter((t) => t.id !== activity.id).slice(0, 4);

  const inclusionList = splitList(activity.inclusions);
  const exclusionList = splitList(activity.exclusions);
  const whatToBringList = splitList(activity.what_to_bring);
  const notAllowedList = splitList(activity.not_allowed);
  const knowBeforeList = splitList(activity.know_before_you_go);
  const additionalInfoList = splitList(activity.additional_info);
  const notSuitableList = splitList(activity.not_suitable_for);

  const descriptionSentences = activity.description
    ? activity.description.match(/[^.!?]+[.!?]+/g) ?? []
    : [];
  const highlights = descriptionSentences.slice(0, 3).map((s) => s.trim());

  const isRefundable = activity.is_refundable ?? true;
  const cancellationHours = activity.free_cancellation_hours ?? 24;

  return (
    <div className="flex flex-col flex-1 bg-white">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-3">
          <Link
            href="/tours"
            className="inline-flex items-center gap-1 text-sm text-gyg-muted hover:text-angkor-orange transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to tours
          </Link>
        </div>

        {/* Gallery (full-bleed collage, GetYourGuide order) */}
        <TourGallery images={images} title={activity.title} />

        {/* Title + rating + provider */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
          {activity.category && (
            <Link
              href={`/category/${activity.category.slug}`}
              className="inline-block text-xs font-semibold text-angkor-orange uppercase tracking-wide mb-2"
            >
              {activity.category.name}
            </Link>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-gyg-navy mb-3">
                {activity.title}
              </h1>

              {activity.provider && (
                <div className="flex items-center gap-2 text-sm text-gyg-muted mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-angkor-orange-light text-angkor-orange font-bold text-xs">
                    {activity.provider.business_name.charAt(0)}
                  </span>
                  <span>
                    By <span className="font-semibold text-gyg-text">{activity.provider.business_name}</span>
                    {activity.provider.avg_rating > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-khmer-gold">
                        <Star className="w-3.5 h-3.5 fill-khmer-gold" /> {Number(activity.provider.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gyg-muted">
                <StarRating rating={activity.avg_rating} reviews={activity.reviews_count} size="md" />
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {durationHours} hours
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> Up to {activity.max_group} travelers
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> {languages}
                </span>
                {activity.is_instant_book && (
                  <span className="flex items-center gap-1 font-semibold text-success-green">
                    <ShieldCheck className="w-4 h-4" /> Instant confirmation
                  </span>
                )}
              </div>
            </div>

            <div className="flex md:flex-col gap-3 md:gap-2 shrink-0">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gyg-text">
                <Heart className="w-4 h-4" /> Save
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gyg-text">
                <Share2 className="w-4 h-4" /> Share
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-10">
            <div className="bg-white rounded-2xl border border-gyg-border shadow-card divide-y divide-gyg-border">
              {/* About this tour */}
              <section className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gyg-navy mb-4">About this tour</h2>
                <p className="text-gyg-muted leading-relaxed whitespace-pre-line">
                  {activity.description}
                </p>

                {/* Quick facts row */}
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                  <span className="flex items-center gap-2 text-gyg-text">
                    <Clock className="w-4 h-4 text-angkor-orange" /> {durationHours} hours
                  </span>
                  <span className="flex items-center gap-2 text-gyg-text">
                    <Users className="w-4 h-4 text-angkor-orange" /> Up to {activity.max_group} travelers
                  </span>
                  <span className="flex items-center gap-2 text-gyg-text">
                    <Globe className="w-4 h-4 text-angkor-orange" /> {languages}
                  </span>
                  <span className="flex items-center gap-2 text-success-green font-medium">
                    <CalendarX className="w-4 h-4" />
                    {isRefundable ? `Free cancellation up to ${cancellationHours}h` : "Non-refundable"}
                  </span>
                  {activity.is_instant_book && (
                    <span className="flex items-center gap-2 text-success-green font-medium">
                      <ShieldCheck className="w-4 h-4" /> Instant confirmation
                    </span>
                  )}
                </div>

                {/* Highlights */}
                {highlights.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-gyg-text mb-3">Highlights</h3>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      {highlights.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gyg-text">
                          <CheckCircle2 className="w-4 h-4 text-angkor-orange shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* What's included */}
              {(inclusionList.length > 0 || exclusionList.length > 0) && (
                <section className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-5">What&#39;s included</h2>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    {inclusionList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3">Included</h3>
                        <ul className="space-y-2">
                          {inclusionList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-text flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success-green shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {exclusionList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3">Not included</h3>
                        <ul className="space-y-2">
                          {exclusionList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-muted flex gap-2">
                              <XCircle className="w-4 h-4 text-error-red shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* What to expect — itinerary */}
              {activity.itinerary?.length > 0 && (
                <section className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-5">What to expect</h2>
                  <div className="relative space-y-5 pl-6">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gyg-border" />
                    {activity.itinerary.map((item, index) => (
                      <div key={index} className="relative flex gap-4">
                        <span className="z-10 shrink-0 w-4 h-4 -ml-6 mt-1 rounded-full bg-angkor-orange ring-4 ring-white flex items-center justify-center text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-gyg-navy">{item.time}</span>
                          <p className="text-gyg-muted mt-0.5 text-sm">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Meeting and pickup */}
              <section className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gyg-navy mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-angkor-orange" /> Meeting and pickup
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="text-gyg-muted w-24 shrink-0">Meeting point</span>
                    <span className="text-gyg-text font-medium">
                      {activity.meeting_point?.address ?? "To be confirmed after booking."}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gyg-muted w-24 shrink-0">Start time</span>
                    <span className="text-gyg-text font-medium">
                      {activity.itinerary?.[0]?.time ?? "Confirm with provider"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gyg-muted w-24 shrink-0">Duration</span>
                    <span className="text-gyg-text font-medium">{durationHours} hours</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gyg-muted w-24 shrink-0">Languages</span>
                    <span className="text-gyg-text font-medium">{languages}</span>
                  </div>
                </div>
                {activity.meeting_point?.lat && activity.meeting_point?.lng ? (
                  <div className="mt-4">
                    <MapEmbed
                      lat={activity.meeting_point.lat}
                      lng={activity.meeting_point.lng}
                      label={`${activity.title} meeting point`}
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gyg-muted">
                    Exact meeting point will be confirmed after booking.
                  </p>
                )}
              </section>

              {/* Additional information */}
              {(whatToBringList.length > 0 || notAllowedList.length > 0 || knowBeforeList.length > 0 || additionalInfoList.length > 0 || notSuitableList.length > 0 || activity.weather_policy || activity.start_time_flexibility) && (
                <section className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-5">Additional information</h2>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    {whatToBringList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Backpack className="w-4 h-4 text-angkor-orange" /> What to bring
                        </h3>
                        <ul className="space-y-2">
                          {whatToBringList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-text flex gap-2">
                              <Check className="w-4 h-4 text-success-green shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {notAllowedList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Ban className="w-4 h-4 text-error-red" /> Not allowed
                        </h3>
                        <ul className="space-y-2">
                          {notAllowedList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-muted flex gap-2">
                              <XCircle className="w-4 h-4 text-error-red shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {knowBeforeList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-angkor-orange" /> Know before you go
                        </h3>
                        <ul className="space-y-2">
                          {knowBeforeList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-muted flex gap-2">
                              <span className="text-gyg-muted">&#8226;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {notSuitableList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-gyg-muted" /> Not suitable for
                        </h3>
                        <ul className="space-y-2">
                          {notSuitableList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-muted flex gap-2">
                              <span className="text-gyg-muted">&#8226;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {additionalInfoList.length > 0 && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4 text-gyg-blue" /> Additional info
                        </h3>
                        <ul className="space-y-2">
                          {additionalInfoList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-muted flex gap-2">
                              <span className="text-gyg-muted">&#8226;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activity.weather_policy && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <CloudRain className="w-4 h-4 text-gyg-blue" /> Weather policy
                        </h3>
                        <p className="text-sm text-gyg-muted">{activity.weather_policy}</p>
                      </div>
                    )}
                    {activity.start_time_flexibility && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Sun className="w-4 h-4 text-angkor-orange" /> Start time
                        </h3>
                        <p className="text-sm text-gyg-muted">{activity.start_time_flexibility}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Cancellation policy */}
              <section className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gyg-navy mb-3">Cancellation policy</h2>
                {isRefundable ? (
                  <p className="text-sm text-gyg-muted">
                    You can cancel up to <span className="font-semibold text-gyg-text">{cancellationHours} hours</span> in
                    advance for a full refund. Cancellations made within {cancellationHours} hours of the start time are
                    non-refundable.
                  </p>
                ) : (
                  <p className="text-sm text-gyg-muted">
                    This activity is non-refundable. No cancellations or changes are permitted after booking.
                  </p>
                )}
              </section>

              {/* Provided by */}
              {activity.provider && (
                <section className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-4">Provided by</h2>
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-14 rounded-full bg-angkor-orange-light flex items-center justify-center shrink-0 overflow-hidden">
                      <span className="text-lg font-bold text-angkor-orange">
                        {activity.provider.business_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gyg-navy">
                          {activity.provider.business_name}
                        </h3>
                        <BadgeCheck className="w-5 h-5 text-gyg-blue" />
                      </div>
                      <p className="text-sm text-gyg-muted mt-1">{activity.provider.bio}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-khmer-gold">
                          <Star className="w-4 h-4 fill-khmer-gold" /> {Number(activity.provider.avg_rating).toFixed(1)}
                        </span>
                        <span className="text-gyg-muted">{activity.provider.total_bookings} bookings</span>
                        <span className="flex items-center gap-1 text-gyg-muted">
                          <Phone className="w-4 h-4" /> Verified contact
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Reviews */}
            {activity.reviews_count > 0 && (
              <section id="reviews" className="mt-10">
                <h2 className="text-2xl font-bold text-gyg-navy mb-5">
                  Reviews ({activity.reviews_count.toLocaleString()})
                </h2>
                <div className="bg-white rounded-2xl border border-gyg-border shadow-card p-6 md:p-8 mb-6">
                  <ReviewSummary rating={activity.avg_rating} reviewsCount={activity.reviews_count} />
                </div>
                {activity.reviews?.length > 0 && (
                  <ReviewList reviews={activity.reviews} perPage={5} />
                )}
              </section>
            )}
            </div>

            {/* Sticky booking card */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <BookingSection
                slug={activity.slug}
                title={activity.title}
                basePriceUsd={activity.base_price_usd}
                durationHours={durationHours}
                maxGroup={activity.max_group}
                languages={languages}
                isInstantBook={activity.is_instant_book}
              />
            </aside>
          </div>
        </div>

        {/* Similar tours */}
        {similarTours.length > 0 && (
          <section className="bg-sand-bg py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeading
                title="You may also like"
                subtitle="Similar experiences in this category"
                href={activity.category ? `/category/${activity.category.slug}` : "/tours"}
                linkText="View all"
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarTours.map((tour) => (
                  <TourCard key={tour.id} {...tour} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
