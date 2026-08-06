import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { fetchProviders } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import {
  Star,
  MapPin,
  Briefcase,
  Search,
  Users,
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  Award,
  HeartHandshake,
} from "lucide-react";

interface Vendor {
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
  logo_url: string | null;
  cover_image_url: string | null;
  specialties: string[];
}

export const metadata: Metadata = {
  title: "Local Tour Guides & Vendors — AngkorWatDayTour",
  description:
    "Meet our verified local tour guides, operators, and experience providers in Cambodia.",
};

function VendorCard({ vendor }: { vendor: Vendor }) {
  const initial = vendor.business_name?.charAt(0).toUpperCase() ?? "V";
  const hasReviews = vendor.avg_rating > 0;
  const topSpecialties = vendor.specialties.slice(0, 3);

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gyg-border shadow-card hover:shadow-hover hover:-translate-y-1.5 transition duration-300 h-full overflow-hidden"
    >
      {/* Cover image strip */}
      <div className="relative h-28 bg-gyg-navy isolate">
        {vendor.cover_image_url ? (
          <Image
            src={vendor.cover_image_url}
            alt={vendor.business_name}
            fill
            className="object-cover opacity-60 group-hover:scale-105 transition duration-500 -z-10"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-gyg-navy/90 to-gyg-navy/30 -z-10" />
        <div className="absolute -bottom-7 left-5 z-10">
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-lg flex items-center justify-center text-xl font-bold text-gyg-navy overflow-hidden">
            {vendor.logo_url ? (
              <Image
                src={vendor.logo_url}
                alt={vendor.business_name}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              initial
            )}
          </div>
        </div>
      </div>

      <div className="p-5 pt-9 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-bold text-gyg-navy text-lg leading-snug line-clamp-2 group-hover:text-gyg-blue transition">
                {vendor.business_name}
              </h3>
              <BadgeCheck className="w-5 h-5 text-gyg-blue shrink-0" />
            </div>
            {vendor.tagline && (
              <p className="text-sm text-gyg-muted line-clamp-1">{vendor.tagline}</p>
            )}
          </div>
        </div>

        {topSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {topSpecialties.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-full bg-gyg-bg text-gyg-text text-[11px] font-medium border border-gyg-border"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-gyg-muted line-clamp-2 mb-4 flex-1 leading-relaxed">
          {vendor.bio ?? `Explore ${vendor.activities_count} experiences offered by ${vendor.business_name}.`}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gyg-muted mb-4">
          {hasReviews ? (
            <span className="inline-flex items-center gap-1 bg-gyg-bg px-2 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-gyg-navy text-gyg-navy" />
              <span className="font-semibold text-gyg-text">{vendor.avg_rating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gyg-bg px-2 py-0.5 rounded-full text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-gyg-blue" />
              New provider
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {vendor.total_bookings.toLocaleString()} bookings
          </span>
          {vendor.founded_year && (
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Since {vendor.founded_year}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          {vendor.service_area ? (
            <span className="flex items-center gap-1.5 text-gyg-text">
              <MapPin className="w-4 h-4 text-gyg-muted" />
              {vendor.service_area}
            </span>
          ) : (
            <span className="text-gyg-muted">Cambodia</span>
          )}
          <span className="inline-flex items-center gap-1.5 text-gyg-navy font-semibold group-hover:text-gyg-blue transition">
            <Briefcase className="w-4 h-4" />
            {vendor.activities_count} {vendor.activities_count === 1 ? "tour" : "tours"}
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TrustBar() {
  const items = [
    { icon: BadgeCheck, label: "Verified providers" },
    { icon: Star, label: "Real traveler reviews" },
    { icon: ShieldCheck, label: "Secure bookings" },
    { icon: HeartHandshake, label: "Local experts" },
  ];

  return (
    <div className="border-y border-gyg-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-gyg-text">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="w-5 h-5 text-tripadvisor-green" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function VendorsPage() {
  const vendors = (await fetchProviders()) as Vendor[];

  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      {/* Hero */}
      <section className="relative bg-gyg-navy overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gyg-blue blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified local experts
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Meet your local guides
            </h1>
            <p className="text-white/80 max-w-2xl text-lg md:text-xl">
              Hand-picked tour operators, guides, and experience creators across Cambodia —
              reviewed by real travelers like you.
            </p>
          </div>
        </div>
      </section>

      <TrustBar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <FadeIn>
          {vendors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gyg-border p-12 text-center">
              <Search className="w-12 h-12 text-gyg-muted mx-auto mb-4" />
              <p className="text-gyg-muted">No verified vendors are available right now.</p>
              <Link
                href="/tours"
                className="inline-block mt-4 text-gyg-navy font-semibold hover:underline"
              >
                Browse all tours
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gyg-navy">
                    {vendors.length} verified {vendors.length === 1 ? "provider" : "providers"}
                  </h2>
                  <p className="text-gyg-muted mt-1">Experience Cambodia with trusted local experts</p>
                </div>

                <form action="/vendors" className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search providers..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gyg-border bg-white text-sm outline-none focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 transition"
                  />
                </form>
              </div>

              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vendors.map((vendor) => (
                  <StaggerItem key={vendor.id}>
                    <VendorCard vendor={vendor} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          )}
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
