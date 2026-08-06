import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchProviders, fetchProvider } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import StarRating from "@/components/StarRating";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import {
  Star,
  MapPin,
  Briefcase,
  ChevronLeft,
  BadgeCheck,
  Users,
  Search,
  Calendar,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Globe,
  Award,
  Phone,
  ExternalLink,
  CheckCircle2,
  Clock,
  HeartHandshake,
} from "lucide-react";

interface ProviderActivity {
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

interface ProviderDetail {
  id: number;
  slug: string;
  business_name: string;
  tagline: string | null;
  bio: string | null;
  service_area: string | null;
  avg_rating: number;
  total_bookings: number;
  activities_count: number;
  founded_year: number | null;
  team_size: number | null;
  spoken_languages: string[];
  certifications: string[];
  specialties: string[];
  website_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  activities: ProviderActivity[];
}

interface ProviderListItem {
  slug: string;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const providers = (await fetchProviders()) as ProviderListItem[];
  return providers.map((provider) => ({ slug: provider.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = (await fetchProvider(slug)) as ProviderDetail | null;

  return {
    title: provider
      ? `${provider.business_name} — Tours & Experiences — AngkorWatDayTour`
      : "Vendor — AngkorWatDayTour",
    description: provider?.bio
      ? `${provider.bio.slice(0, 155)}...`
      : "Browse tours and experiences from this verified provider on AngkorWatDayTour.",
  };
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gyg-navy/70 backdrop-blur-sm border border-white/20 shadow-sm">
      <Icon className="w-5 h-5 text-white" />
      <div>
        <div className="text-base font-bold text-white leading-none [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{value}</div>
        <div className="text-xs text-white mt-0.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{label}</div>
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gyg-navy/70 border border-white/20 text-sm text-white shadow-sm backdrop-blur-sm">
      <Icon className="w-4 h-4 text-white" />
      <span className="font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{label}</span>
    </div>
  );
}

function ContactButton({
  href,
  icon: Icon,
  label,
  variant = "outline",
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  variant?: "primary" | "outline";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        variant === "primary"
          ? "bg-tripadvisor-green hover:bg-tripadvisor-green-dark text-white"
          : "bg-white hover:bg-gyg-bg text-gyg-navy border border-gyg-border"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </a>
  );
}

function languageLabel(code: string): string {
  const map: Record<string, string> = {
    en: "English",
    km: "Khmer",
    fr: "French",
    zh: "Chinese",
    ja: "Japanese",
    es: "Spanish",
  };
  return map[code] ?? code.toUpperCase();
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Support both slug and legacy numeric id URLs: numeric values redirect to the canonical slug.
  const provider = (await fetchProvider(slug)) as ProviderDetail | null;

  if (!provider) {
    notFound();
  }

  if (/^\d+$/.test(slug) && provider.slug && provider.slug !== slug) {
    redirect(`/vendors/${provider.slug}`);
  }

  const initial = provider.business_name?.charAt(0).toUpperCase() ?? "V";
  const hasActivities = provider.activities.length > 0;
  const displayRating = provider.avg_rating > 0 ? provider.avg_rating.toFixed(1) : "New";
  const displayReviews = provider.avg_rating > 0 ? `${provider.avg_rating.toFixed(1)} / 5` : "No reviews yet";
  const foundedAgo = provider.founded_year ? `${new Date().getFullYear() - provider.founded_year} years` : null;

  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      {/* Cover / hero */}
      <section className="relative bg-gyg-navy overflow-hidden z-0">
        {provider.cover_image_url ? (
          <Image
            src={provider.cover_image_url}
            alt={provider.business_name}
            fill
            className="object-cover opacity-30 -z-10"
            sizes="100vw"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-gyg-navy via-gyg-navy/90 to-gyg-navy/80 -z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20 md:pb-28">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-gyg-navy/40 hover:bg-gyg-navy/60 px-3 py-1.5 rounded-full backdrop-blur-sm transition mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to all vendors
          </Link>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-white to-gyg-bg text-gyg-navy flex items-center justify-center text-5xl md:text-6xl font-bold shrink-0 shadow-2xl border-4 border-white overflow-hidden">
              {provider.logo_url ? (
                <Image
                  src={provider.logo_url}
                  alt={provider.business_name}
                  fill
                  className="object-cover"
                  sizes="144px"
                />
              ) : (
                <span className="z-10">{initial}</span>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                  {provider.business_name}
                </h1>
                <BadgeCheck className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
              </div>

              {provider.tagline && (
                <p className="text-lg text-white font-medium mb-3 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">{provider.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <TrustBadge icon={ShieldCheck} label="Verified provider" />
                <TrustBadge icon={Clock} label="24h free cancellation" />
                <TrustBadge icon={HeartHandshake} label="Local expert" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatPill icon={Star} value={displayRating} label={displayReviews} />
                <StatPill
                  icon={Users}
                  value={provider.total_bookings.toLocaleString()}
                  label={`booking${provider.total_bookings === 1 ? "" : "s"}`}
                />
                <StatPill
                  icon={Briefcase}
                  value={String(provider.activities_count)}
                  label={`tour${provider.activities_count === 1 ? "" : "s"}`}
                />
                {foundedAgo && provider.founded_year && (
                  <StatPill
                    icon={Calendar}
                    value={foundedAgo}
                    label={`Since ${provider.founded_year}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 -mt-10 pb-16 w-full">
        <FadeIn>
          <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
            {/* Sticky sidebar */}
            <aside className="lg:sticky lg:top-24 z-20 space-y-6">
              {/* TripAdvisor-style "Book with confidence" box */}
              <div className="bg-white rounded-2xl border border-gyg-border shadow-card p-6">
                <h2 className="text-lg font-bold text-gyg-navy mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-tripadvisor-green" /> Book with confidence
                </h2>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3 text-gyg-text">
                    <BadgeCheck className="w-4 h-4 text-tripadvisor-green shrink-0 mt-0.5" />
                    Verified local provider
                  </li>
                  <li className="flex items-start gap-3 text-gyg-text">
                    <Calendar className="w-4 h-4 text-tripadvisor-green shrink-0 mt-0.5" />
                    Instant confirmation on eligible tours
                  </li>
                  <li className="flex items-start gap-3 text-gyg-text">
                    <Globe className="w-4 h-4 text-tripadvisor-green shrink-0 mt-0.5" />
                    {provider.spoken_languages.length > 0
                      ? `Guided in ${provider.spoken_languages.map(languageLabel).join(", ")}`
                      : "English & Khmer speaking guides"}
                  </li>
                  <li className="flex items-start gap-3 text-gyg-text">
                    <Award className="w-4 h-4 text-tripadvisor-green shrink-0 mt-0.5" />
                    Free cancellation up to 24h before
                  </li>
                </ul>

                <button
                  type="button"
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-tripadvisor-green text-white px-4 py-3 text-sm font-semibold hover:bg-tripadvisor-green-dark transition shadow-soft"
                >
                  <MessageCircle className="w-4 h-4" /> Contact provider
                </button>
              </div>

              {provider.bio && (
                <div className="bg-white rounded-2xl border border-gyg-border shadow-card p-6">
                  <h2 className="text-lg font-bold text-gyg-navy mb-3">About the operator</h2>
                  <p className="text-sm text-gyg-muted leading-relaxed whitespace-pre-line">{provider.bio}</p>
                </div>
              )}

              {/* Certifications & specialties */}
              {(provider.certifications.length > 0 || provider.specialties.length > 0) && (
                <div className="bg-white rounded-2xl border border-gyg-border shadow-card p-6 space-y-4">
                  {provider.specialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gyg-navy mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {provider.specialties.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full bg-gyg-bg text-gyg-text text-xs font-medium border border-gyg-border"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {provider.certifications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gyg-navy mb-2">Certifications</h3>
                      <ul className="space-y-1.5">
                        {provider.certifications.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-sm text-gyg-text">
                            <CheckCircle2 className="w-4 h-4 text-tripadvisor-green shrink-0 mt-0.5" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Rating card */}
              <div className="bg-gradient-to-br from-gyg-navy to-gyg-blue rounded-2xl p-6 text-white shadow-card">
                <div className="text-xs text-white/70 uppercase tracking-wide font-semibold mb-1">Trusted on AngkorWatDayTour</div>
                <div className="text-2xl font-extrabold mb-2">{displayRating}</div>
                <div className="flex items-center gap-1 mb-3">
                  <StarRating rating={provider.avg_rating} reviews={0} size="sm" />
                </div>
                <p className="text-sm text-white/80">
                  Average rating across {provider.total_bookings.toLocaleString()} bookings
                </p>
              </div>
            </aside>

            {/* Main content */}
            <div className="relative z-10 space-y-6">
              <div className="bg-white rounded-2xl border border-gyg-border shadow-card p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gyg-navy">Experiences by {provider.business_name}</h2>
                    <p className="text-gyg-muted mt-1">
                      {hasActivities
                        ? `Browse ${provider.activities.length} ${provider.activities.length === 1 ? "hand-picked tour" : "hand-picked tours"}`
                        : "No experiences listed yet"}
                    </p>
                  </div>
                  {hasActivities && (
                    <Link
                      href={`/tours?provider=${provider.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-gyg-navy hover:text-gyg-blue transition"
                    >
                      View all tours <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {hasActivities ? (
                  <StaggerContainer className="grid sm:grid-cols-2 xl:grid-cols-2 gap-6">
                    {provider.activities.map((activity) => (
                      <StaggerItem key={activity.id}>
                        <TourCard {...activity} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                ) : (
                  <div className="text-center py-14 rounded-xl bg-gyg-bg border border-dashed border-gyg-border">
                    <Search className="w-12 h-12 text-gyg-muted mx-auto mb-4" />
                    <p className="text-gyg-muted">This provider has not published any tours yet.</p>
                    <Link
                      href="/tours"
                      className="inline-block mt-4 text-gyg-navy font-semibold hover:underline"
                    >
                      Browse all tours
                    </Link>
                  </div>
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
