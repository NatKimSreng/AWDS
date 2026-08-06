import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import { fetchActivities, fetchCategories, fetchCities, fetchServiceTypes, fetchTransportModes } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import TourCarousel from "@/components/TourCarousel";
import ImageCarousel from "@/components/ImageCarousel";
import SectionHeading from "@/components/SectionHeading";
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from "@/components/MotionWrapper";
import { ChevronRight, MapPin, ShieldCheck, Star } from "lucide-react";

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
  provider: { business_name: string; avg_rating?: number } | null;
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

const ATTRACTIONS = [
  {
    slug: "angkor-wat",
    name: "Angkor Wat",
    image: "/images/hero-angkor.jpg",
    tours: "30+",
  },
  {
    slug: "bayon",
    name: "Bayon Temple",
    image: "/images/bayon.jpg",
    tours: "18+",
  },
  {
    slug: "ta-prohm",
    name: "Ta Prohm",
    image: "/images/taprohm.jpg",
    tours: "15+",
  },
  {
    slug: "tonle-sap",
    name: "Tonlé Sap",
    image: "/images/tonlesap.jpg",
    tours: "12+",
  },
];

const HERO_TRUST = [
  { icon: Star, text: "4.9 average rating" },
  { icon: ShieldCheck, text: "Free cancellation" },
  { icon: MapPin, text: "Verified local guides" },
];

export default async function Home() {
  const topActivities = (await fetchActivities({ per_page: "8", featured: "1" })) as Activity[];
  const sunriseTours = (await fetchActivities({ per_page: "8", query: "sunrise" })) as Activity[];
  const tukTukTours = (await fetchActivities({ per_page: "8", query: "tuk tuk" })) as Activity[];
  const categories = (await fetchCategories()) as Category[];
  const cities = (await fetchCities()) as City[];
  const serviceTypes = (await fetchServiceTypes()) as { id: number; name: string; slug: string; icon: string | null; badge_color: string | null }[];
  const transportModes = (await fetchTransportModes()) as { id: number; name: string; slug: string; icon: string | null; badge_color: string | null; category: string }[];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[600px] flex items-center justify-center">
        <Image
          src="/images/hero-angkor.jpg"
          alt="Angkor Wat sunrise"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center text-white">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              Find things to do in Cambodia
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Skip the lines, book with verified local guides, and explore Angkor your way.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-2 shadow-2xl border border-white/20">
              <Suspense fallback={<div className="h-16 bg-white/20 rounded-[28px] animate-pulse" />}>
                <div className="bg-white rounded-[28px] p-1.5 shadow-xl">
                  <SearchBar />
                </div>
              </Suspense>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-medium text-white/90">
              {HERO_TRUST.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-angkor-orange-light" />
                  {text}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full space-y-16">
        {/* Top activities */}
        <FadeIn>
          <section>
            <SectionHeading
              title="Top activities"
              subtitle="Hand-picked tours loved by travelers"
              href="/tours"
              linkText="See all"
            />
            {topActivities.length === 0 ? (
              <p className="text-gyg-muted">No tours available right now.</p>
            ) : (
              <TourCarousel activities={topActivities} featured autoplay />
            )}
          </section>
        </FadeIn>

        {/* Sunrise tours */}
        <FadeIn>
          <section>
            <SectionHeading
              title="Sunrise tours"
              subtitle="Catch Angkor Wat at golden hour"
              href="/tours?q=sunrise"
              linkText="See all"
            />
            {sunriseTours.length === 0 ? (
              <p className="text-gyg-muted">No sunrise tours found.</p>
            ) : (
              <TourCarousel activities={sunriseTours} />
            )}
          </section>
        </FadeIn>

        {/* Private tuk-tuk tours */}
        <FadeIn>
          <section>
            <SectionHeading
              title="Private tuk-tuk tours"
              subtitle="Zip around the temples with a local driver"
              href="/tours?q=tuk+tuk"
              linkText="See all"
            />
            {tukTukTours.length === 0 ? (
              <p className="text-gyg-muted">No tuk-tuk tours found.</p>
            ) : (
              <TourCarousel activities={tukTukTours} />
            )}
          </section>
        </FadeIn>

        {/* Attractions */}
        <FadeIn>
          <section>
            <SectionHeading
              title="Attractions you can't miss"
              subtitle="The must-see sights and experiences in Cambodia"
              href="/tours"
              linkText="See all attractions"
            />

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {ATTRACTIONS.map((attraction) => (
                <StaggerItem key={attraction.slug}>
                  <HoverLift>
                    <Link
                      href={`/tours?q=${encodeURIComponent(attraction.name)}`}
                      className="group relative h-52 md:h-64 rounded-2xl overflow-hidden bg-gray-100 block shadow-card"
                    >
                      <Image
                        src={attraction.image}
                        alt={attraction.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="font-bold text-base md:text-lg">{attraction.name}</div>
                        <div className="text-xs text-white/80">{attraction.tours} tours</div>
                      </div>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Transport Modes — How to get there */}
        <FadeIn>
          <section>
            <SectionHeading
              title="How to get there"
              subtitle="Choose your ride — from tuk-tuk to airplane, UFO and more"
              href="/tours"
              linkText="All transport options"
            />

            <ImageCarousel
              items={transportModes.map((mode) => ({
                id: mode.id,
                name: mode.name,
                slug: mode.slug,
                image: mode.image,
                badge_color: mode.badge_color,
                subtitle: `${mode.category} transport`,
              }))}
              linkPrefix="/tours"
              queryParam="transport_mode"
            />
          </section>
        </FadeIn>

        {/* Service Types — What you can book */}
        <FadeIn>
          <section>
            <SectionHeading
              title="What you can book"
              subtitle="Photography, private tours, vehicle charter, rentals and more"
              href="/tours"
              linkText="All services"
            />

            <ImageCarousel
              items={serviceTypes.map((st) => ({
                id: st.id,
                name: st.name,
                slug: st.slug,
                image: st.image,
                badge_color: st.badge_color,
                subtitle: st.description ?? 'Explore options',
              }))}
              linkPrefix="/tours"
              queryParam="service_type"
            />
          </section>
        </FadeIn>

        {/* Destinations */}
        <FadeIn>
          <section>
            <SectionHeading
              title="Things to do wherever you're going"
              subtitle="Explore top destinations across Cambodia"
              href="/tours"
              linkText="View all destinations"
            />

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {cities.slice(0, 4).map((city) => (
                <StaggerItem key={city.id}>
                  <HoverLift>
                    <Link
                      href={`/tours?city=${city.slug}`}
                      className="group relative h-52 md:h-64 rounded-2xl overflow-hidden bg-gray-100 block shadow-card"
                    >
                      <Image
                        src="/images/hero-angkor.jpg"
                        alt={city.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="font-bold text-base md:text-lg">{city.name}</div>
                        <div className="text-xs text-white/80 flex items-center gap-1">
                          Explore tours <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Categories */}
        <FadeIn>
          <section>
            <SectionHeading
              title="Explore by category"
              subtitle="Find the perfect experience for your trip"
              href="/tours"
              linkText="All categories"
            />

            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 mt-6">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="shrink-0 px-5 py-3 rounded-full bg-white border border-gyg-border text-gyg-text font-medium hover:border-gyg-navy hover:text-gyg-navy hover:shadow-soft transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
