import Image from "next/image";
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
import SectionNav from "@/components/SectionNav";
import TourCard from "@/components/TourCard";
import TourFavoriteButton from "@/components/TourFavoriteButton";
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

interface MapData {
  lat: number;
  lng: number;
  address?: string | null;
  google_maps_url?: string;
  google_maps_embed_url?: string;
  openstreetmap_url?: string;
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
  map: MapData | null;
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
    slug?: string;
    business_name: string;
    tagline?: string | null;
    bio: string;
    avg_rating: number;
    total_bookings: number;
    logo_url?: string | null;
    cover_image_url?: string | null;
    founded_year?: number | null;
    team_size?: number | null;
    certifications?: string[];
    specialties?: string[];
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
  const basePrice = Number(activity.base_price_usd);
  const competitorPrices = {
    tripadvisor: Math.ceil(basePrice * 1.28),
    airbnb: Math.ceil(basePrice * 1.45),
    getyourguide: Math.ceil(basePrice * 1.22),
  };
  const images = [activity.hero_image, ...(activity.gallery ?? [])].filter(Boolean) as string[];
  const cityName = activity.city?.name ?? "Siem Reap";
  const tripType = activity.duration_minutes >= 1440 ? "Multi-day trip" : "Day trip";
  const titleText = activity.title.toLowerCase().startsWith("from")
    ? activity.title
    : `From ${cityName}: ${activity.title}`;
  const showPickup = Boolean(activity.meeting_point?.address);
  const showPrivate = activity.max_group <= 5;

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

  const navItems = [
    { id: "overview", label: "Overview" },
    ...(inclusionList.length > 0 || exclusionList.length > 0
      ? [{ id: "included", label: "What's included" }]
      : []),
    ...(activity.itinerary?.length > 0 ? [{ id: "itinerary", label: "Itinerary" }] : []),
    { id: "meeting-point", label: "Meeting point" },
    ...(whatToBringList.length > 0 ||
    notAllowedList.length > 0 ||
    knowBeforeList.length > 0 ||
    additionalInfoList.length > 0 ||
    notSuitableList.length > 0 ||
    activity.weather_policy ||
    activity.start_time_flexibility
      ? [{ id: "additional-info", label: "Additional info" }]
      : []),
    ...(activity.reviews_count > 0 ? [{ id: "reviews", label: "Reviews" }] : []),
    ...(activity.provider ? [{ id: "provider", label: "Provider" }] : []),
  ];

  return (
    <div className="flex flex-col flex-1 bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <Link
            href="/tours"
            className="inline-flex items-center gap-1 text-sm text-gyg-muted hover:text-gyg-text transition"
          >
            <ChevronLeft className="w-4 h-4" /> Tours in {cityName}
          </Link>
        </div>

        {/* Gallery */}
        <TourGallery images={images} title={activity.title} />

        {/* Title + rating + price row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gyg-muted mb-2">
                From {cityName} <span className="mx-1.5 text-gyg-border">·</span> {tripType}
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-gyg-navy mb-3 leading-tight">
                {titleText}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gyg-muted mb-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {durationHours} hours
                </span>
                {showPrivate && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Private group
                  </span>
                )}
                {showPickup && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Pickup available
                  </span>
                )}
                {activity.is_instant_book && (
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Instant confirmation
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={activity.avg_rating} reviews={activity.reviews_count} size="md" />
                {activity.provider && (
                  <span className="text-sm text-gyg-muted">
                    By{" "}
                    <Link
                      href={`/vendors/${activity.provider.slug ?? activity.provider.id}`}
                      className="font-semibold text-gyg-text hover:text-gyg-navy hover:underline"
                    >
                      {activity.provider.business_name}
                    </Link>
                  </span>
                )}
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <div className="text-sm text-gyg-muted">From</div>
                <div className="text-3xl font-bold text-gyg-navy">
                  ${Number(activity.base_price_usd).toFixed(2)}
                </div>
                <div className="text-sm text-gyg-muted">per person</div>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-gyg-text">
                <TourFavoriteButton activityId={activity.id} />
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-gyg-navy transition"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky section navigation */}
        <SectionNav items={navItems} />

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
            <div className="space-y-6">
              {/* Overview */}
              <section id="overview" className="bg-background rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-gyg-navy mb-4">About this tour</h2>
                <p className="text-gyg-muted leading-relaxed whitespace-pre-line">
                  {activity.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                  <span className="flex items-center gap-2 text-gyg-text">
                    <Clock className="w-4 h-4 text-gyg-navy" /> {durationHours} hours
                  </span>
                  <span className="flex items-center gap-2 text-gyg-text">
                    <Users className="w-4 h-4 text-gyg-navy" /> Up to {activity.max_group} travelers
                  </span>
                  <span className="flex items-center gap-2 text-gyg-text">
                    <Globe className="w-4 h-4 text-gyg-navy" /> {languages}
                  </span>
                  <span className="flex items-center gap-2 text-gyg-text">
                    <CalendarX className="w-4 h-4 text-gyg-navy" />
                    {isRefundable
                      ? `Free cancellation up to ${cancellationHours}h`
                      : "Non-refundable"}
                  </span>
                  {activity.is_instant_book && (
                    <span className="flex items-center gap-2 text-gyg-text">
                      <ShieldCheck className="w-4 h-4 text-gyg-navy" /> Instant confirmation
                    </span>
                  )}
                </div>

                {highlights.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gyg-border">
                    <h3 className="text-sm font-bold text-gyg-text mb-3">Highlights</h3>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      {highlights.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gyg-text">
                          <CheckCircle2 className="w-4 h-4 text-gyg-navy shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* What's included */}
              {(inclusionList.length > 0 || exclusionList.length > 0) && (
                <section id="included" className="bg-background rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-5">What&#39;s included</h2>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    {inclusionList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3">Included</h3>
                        <ul className="space-y-2">
                          {inclusionList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-text flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-gyg-navy shrink-0 mt-0.5" /> {item}
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
                              <XCircle className="w-4 h-4 text-gyg-muted shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Itinerary */}
              {activity.itinerary?.length > 0 && (
                <section id="itinerary" className="bg-background rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-5">Itinerary</h2>
                  <div className="relative space-y-6 pl-6">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gyg-border" />
                    {activity.itinerary.map((item, index) => (
                      <div key={index} className="relative flex gap-4">
                        <span className="z-10 shrink-0 w-4 h-4 -ml-6 mt-1 rounded-full bg-gyg-navy ring-4 ring-background flex items-center justify-center text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-gyg-text">{item.time}</span>
                          <p className="text-gyg-muted mt-0.5 text-sm">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Meeting and pickup */}
              <section id="meeting-point" className="bg-background rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-gyg-navy mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gyg-navy" /> Meeting and pickup
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
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

                {activity.map ? (
                  <MapEmbed
                    lat={activity.map.lat}
                    lng={activity.map.lng}
                    address={activity.map.address}
                    googleMapsEmbedUrl={activity.map.google_maps_embed_url}
                    googleMapsUrl={activity.map.google_maps_url}
                    openStreetMapUrl={activity.map.openstreetmap_url}
                    height="h-64 md:h-72"
                  />
                ) : (
                  <p className="text-sm text-gyg-muted">
                    Exact meeting point will be confirmed after booking.
                  </p>
                )}
              </section>

              {/* Additional information */}
              {(whatToBringList.length > 0 ||
                notAllowedList.length > 0 ||
                knowBeforeList.length > 0 ||
                additionalInfoList.length > 0 ||
                notSuitableList.length > 0 ||
                activity.weather_policy ||
                activity.start_time_flexibility) && (
                <section id="additional-info" className="bg-background rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-5">Additional information</h2>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    {whatToBringList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Backpack className="w-4 h-4 text-gyg-navy" /> What to bring
                        </h3>
                        <ul className="space-y-2">
                          {whatToBringList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-text flex gap-2">
                              <Check className="w-4 h-4 text-gyg-navy shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {notAllowedList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Ban className="w-4 h-4 text-gyg-muted" /> Not allowed
                        </h3>
                        <ul className="space-y-2">
                          {notAllowedList.map((item, idx) => (
                            <li key={idx} className="text-sm text-gyg-muted flex gap-2">
                              <XCircle className="w-4 h-4 text-gyg-muted shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {knowBeforeList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gyg-navy" /> Know before you go
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
                          <Info className="w-4 h-4 text-gyg-navy" /> Additional info
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
                          <CloudRain className="w-4 h-4 text-gyg-navy" /> Weather policy
                        </h3>
                        <p className="text-sm text-gyg-muted">{activity.weather_policy}</p>
                      </div>
                    )}
                    {activity.start_time_flexibility && (
                      <div>
                        <h3 className="text-sm font-bold text-gyg-text mb-3 flex items-center gap-2">
                          <Sun className="w-4 h-4 text-gyg-navy" /> Start time
                        </h3>
                        <p className="text-sm text-gyg-muted">{activity.start_time_flexibility}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gyg-border">
                    <h3 className="text-sm font-bold text-gyg-text mb-2">Cancellation policy</h3>
                    {isRefundable ? (
                      <p className="text-sm text-gyg-muted">
                        You can cancel up to{" "}
                        <span className="font-semibold text-gyg-text">{cancellationHours} hours</span>{" "}
                        in advance for a full refund. Cancellations made within {cancellationHours}{" "}
                        hours of the start time are non-refundable.
                      </p>
                    ) : (
                      <p className="text-sm text-gyg-muted">
                        This activity is non-refundable. No cancellations or changes are permitted
                        after booking.
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Provider */}
              {activity.provider && (
                <section id="provider" className="bg-background rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gyg-navy">Provided by</h2>
                    <Link
                      href={`/vendors/${activity.provider.slug ?? activity.provider.id}`}
                      className="text-sm font-semibold text-tripadvisor-green hover:text-tripadvisor-green-dark transition"
                    >
                      View full profile →
                    </Link>
                  </div>

                  <Link
                    href={`/vendors/${activity.provider.slug ?? activity.provider.id}`}
                    className="group flex items-start gap-4"
                  >
                    <div className="relative w-16 h-16 rounded-2xl bg-gyg-bg border border-gyg-border flex items-center justify-center shrink-0 overflow-hidden group-hover:border-tripadvisor-green transition">
                      {activity.provider.logo_url ? (
                        <Image
                          src={activity.provider.logo_url}
                          alt={activity.provider.business_name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gyg-navy">
                          {activity.provider.business_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gyg-navy group-hover:text-tripadvisor-green transition">
                          {activity.provider.business_name}
                        </h3>
                        <BadgeCheck className="w-5 h-5 text-tripadvisor-green" />
                      </div>
                      {activity.provider.tagline && (
                        <p className="text-sm text-gyg-muted mt-0.5">{activity.provider.tagline}</p>
                      )}
                      <p className="text-sm text-gyg-muted mt-1 line-clamp-2">{activity.provider.bio}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tripadvisor-green-light text-tripadvisor-green-dark text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />{" "}
                          {Number(activity.provider.avg_rating).toFixed(1)}
                        </span>
                        <span className="text-gyg-muted">{activity.provider.total_bookings} bookings</span>
                        {activity.provider.team_size && (
                          <span className="text-gyg-muted">Team of {activity.provider.team_size}</span>
                        )}
                        <span className="inline-flex items-center gap-1 text-gyg-muted">
                          <Phone className="w-3.5 h-3.5" /> Verified contact
                        </span>
                      </div>
                    </div>
                  </Link>
                </section>
              )}

              {/* Reviews */}
              {activity.reviews_count > 0 && (
                <section id="reviews" className="bg-background rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gyg-navy mb-5">
                    Reviews ({activity.reviews_count.toLocaleString()})
                  </h2>
                  <div className="mb-6">
                    <ReviewSummary rating={activity.avg_rating} reviewsCount={activity.reviews_count} />
                  </div>
                  {activity.reviews?.length > 0 && (
                    <ReviewList reviews={activity.reviews} perPage={5} />
                  )}
                </section>
              )}
            </div>

            {/* Sticky booking card */}
            <aside className="lg:sticky lg:top-40 z-20 h-fit space-y-4">
              <BookingSection
                slug={activity.slug}
                title={activity.title}
                basePriceUsd={activity.base_price_usd}
                durationHours={durationHours}
                maxGroup={activity.max_group}
                languages={languages}
                isInstantBook={activity.is_instant_book}
              />

              {/* Price comparison */}
              <div className="bg-background rounded-2xl border border-gyg-border shadow-card p-5">
                <h3 className="text-sm font-bold text-gyg-navy mb-3">Also available on</h3>
                <div className="space-y-2">
                  <a
                    href={`https://www.tripadvisor.com/Search?q=${encodeURIComponent(activity.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl px-4 py-3 border border-[#00AA6C]/30 bg-[#00AA6C]/5 hover:bg-[#00AA6C]/10 transition"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#00AA6C]">
                      <Image src="/tripadvisor-logo.svg" alt="TripAdvisor" width={20} height={20} className="shrink-0" />
                      TripAdvisor
                    </span>
                    <span className="text-sm font-bold text-[#00AA6C]">${competitorPrices.tripadvisor.toFixed(2)}</span>
                  </a>
                  <a
                    href={`https://www.airbnb.com/s/${encodeURIComponent(activity.title)}/experiences`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl px-4 py-3 border border-[#FF5A5F]/30 bg-[#FF5A5F]/5 hover:bg-[#FF5A5F]/10 transition"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#FF5A5F]">
                      <Image src="/airbnb-logo.svg" alt="Airbnb" width={20} height={20} className="shrink-0" />
                      Airbnb
                    </span>
                    <span className="text-sm font-bold text-[#FF5A5F]">${competitorPrices.airbnb.toFixed(2)}</span>
                  </a>
                  <a
                    href={`https://www.getyourguide.com/s/?q=${encodeURIComponent(activity.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl px-4 py-3 border border-[#0071EB]/30 bg-[#0071EB]/5 hover:bg-[#0071EB]/10 transition"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#0071EB]">
                      <Image src="/getyourguide-logo.svg" alt="GetYourGuide" width={20} height={20} className="shrink-0" />
                      GetYourGuide
                    </span>
                    <span className="text-sm font-bold text-[#0071EB]">${competitorPrices.getyourguide.toFixed(2)}</span>
                  </a>
                </div>
                <p className="text-xs text-gyg-muted mt-3">
                  You save up to <span className="font-bold text-angkor-orange">${(competitorPrices.airbnb - basePrice).toFixed(2)}</span> by booking direct with us.
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* Similar tours */}
        {similarTours.length > 0 && (
          <section className="bg-gyg-bg py-12">
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
