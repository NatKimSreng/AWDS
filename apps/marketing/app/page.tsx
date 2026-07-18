import Link from "next/link";
import Image from "next/image";
import { fetchActivities, fetchCategories, fetchCities } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchHero from "@/components/SearchHero";
import TourCard from "@/components/TourCard";
import {
  ShieldCheck,
  Clock,
  Wallet,
  Headphones,
  Search,
  CalendarCheck,
  Smartphone,
  Ticket,
  ChevronRight,
  MapPin,
  Star,
  Landmark,
  Utensils,
  Bike,
  Palmtree,
  Camera,
  Compass,
  Sunrise,
} from "lucide-react";

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

const CITY_IMAGES: Record<string, string> = {
  "siem-reap": "/images/hero-angkor.jpg",
  "phnom-penh": "/images/phnom-penh.jpg",
  kampot: "/images/kampot.jpg",
  battambang: "/images/battambang.jpg",
};

const ATTRACTIONS = [
  {
    slug: "angkor-wat",
    name: "Angkor Wat",
    image: "/images/hero-angkor.jpg",
    countLabel: "30+ tours",
  },
  {
    slug: "bayon",
    name: "Bayon Temple",
    image: "/images/bayon.jpg",
    countLabel: "18+ tours",
  },
  {
    slug: "ta-prohm",
    name: "Ta Prohm",
    image: "/images/taprohm.jpg",
    countLabel: "15+ tours",
  },
  {
    slug: "tonle-sap",
    name: "Tonlé Sap",
    image: "/images/tonlesap.jpg",
    countLabel: "12+ tours",
  },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "temples-history": Landmark,
  "food-culture": Utensils,
  "adventure-outdoor": Bike,
  "nature-wildlife": Palmtree,
  "sunrise-sunset": Sunrise,
  photography: Camera,
  "local-experiences": Compass,
};

export default async function Home() {
  const activities = (await fetchActivities({ per_page: "8", featured: "1" })) as Activity[];
  const categories = (await fetchCategories()) as Category[];
  const cities = (await fetchCities()) as City[];

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <SearchHero />

      <main className="flex-1">
        {/* Categories */}
        <section className="py-8 bg-white border-b border-gyg-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {categories.slice(0, 10).map((category) => {
                const Icon = CATEGORY_ICONS[category.slug] ?? Compass;
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-sand-bg text-gyg-text font-medium hover:bg-angkor-orange hover:text-white transition"
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gyg-navy mb-1">
                  Things to do wherever you&#39;re going
                </h2>
                <p className="text-gyg-muted">Explore top destinations across Cambodia</p>
              </div>
              <Link
                href="/tours"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-angkor-orange hover:underline"
              >
                View all destinations <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cities.slice(0, 4).map((city) => {
                const image = CITY_IMAGES[city.slug] ?? CITY_IMAGES["siem-reap"];
                return (
                  <Link
                    key={city.id}
                    href={`/tours?city=${city.slug}`}
                    className="group relative h-56 md:h-72 rounded-2xl overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={image}
                      alt={city.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-1 text-xs text-white/80 mb-1">
                        <MapPin className="w-3 h-3" /> Cambodia
                      </div>
                      <div className="font-bold text-lg md:text-xl">{city.name}</div>
                      <div className="text-sm text-white/80 group-hover:text-white transition flex items-center gap-1">
                        Explore tours <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Attractions */}
        <section className="py-14 bg-sand-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gyg-navy mb-1">
                  Attractions you can&#39;t miss
                </h2>
                <p className="text-gyg-muted">The must-see sights and experiences in Cambodia</p>
              </div>
              <Link
                href="/tours"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-angkor-orange hover:underline"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ATTRACTIONS.map((attraction) => (
                <Link
                  key={attraction.slug}
                  href={`/tours?q=${encodeURIComponent(attraction.name)}`}
                  className="group relative h-48 md:h-60 rounded-2xl overflow-hidden bg-gray-100"
                >
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="font-bold text-base md:text-lg">{attraction.name}</div>
                    <div className="text-xs text-white/80 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-khmer-gold text-khmer-gold" /> {attraction.countLabel}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured tours */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gyg-navy mb-1">Top-rated experiences</h2>
                <p className="text-gyg-muted">Hand-picked tours loved by travelers</p>
              </div>
              <Link
                href="/tours"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-angkor-orange hover:underline"
              >
                See all tours <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {activities.length === 0 ? (
              <p className="text-gyg-muted">No tours available right now.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activities.map((activity) => (
                  <TourCard key={activity.id} {...activity} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 bg-sand-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gyg-navy mb-2">Book in 4 simple steps</h2>
              <p className="text-gyg-muted">Your Cambodian adventure starts here</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Search,
                  title: "1. Search",
                  body: "Browse tours, transport, and guides by destination or activity.",
                },
                {
                  icon: CalendarCheck,
                  title: "2. Choose a date",
                  body: "See real-time availability and pick the slot that fits your plans.",
                },
                {
                  icon: Wallet,
                  title: "3. Book instantly",
                  body: "Secure your spot with flexible USD/KHR payment on the web or app.",
                },
                {
                  icon: Ticket,
                  title: "4. Get your ticket",
                  body: "Receive a mobile e-ticket with QR code and meet your provider.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-gyg-border"
                >
                  <div className="w-12 h-12 rounded-full bg-angkor-orange-light flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-angkor-orange" />
                  </div>
                  <h3 className="font-bold text-gyg-text mb-2">{item.title}</h3>
                  <p className="text-sm text-gyg-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why book with us */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gyg-navy mb-2">Why book with AngkorWatDayTour?</h2>
              <p className="text-gyg-muted">The easier way to discover Cambodia</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified providers",
                  body: "Every guide, driver, and photographer is reviewed.",
                },
                {
                  icon: Clock,
                  title: "Instant confirmation",
                  body: "Check real-time availability and book in seconds.",
                },
                {
                  icon: Wallet,
                  title: "Flexible payment",
                  body: "Pay with KHQR, Visa, or Mastercard in USD/KHR.",
                },
                {
                  icon: Headphones,
                  title: "24/7 support",
                  body: "Local help when you need it during your trip.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-sand-bg rounded-2xl p-6 border border-gyg-border"
                >
                  <item.icon className="w-8 h-8 text-angkor-orange mb-4" />
                  <h3 className="font-bold text-gyg-text mb-1">{item.title}</h3>
                  <p className="text-sm text-gyg-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* App CTA */}
        <section className="py-16 bg-angkor-orange text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Smartphone className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Book on the go</h2>
            </div>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Download the AngkorWatDayTour app for mobile tickets, live chat support, and instant booking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://play.google.com/store/apps/details?id=com.angkorwatdaytour.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-white text-angkor-orange px-6 py-3 font-semibold hover:bg-gray-100 transition"
              >
                Get it on Google Play
              </a>
              <a
                href="https://apps.apple.com/app/angkorwatdaytour/id0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white text-white px-6 py-3 font-semibold hover:bg-white/10 transition"
              >
                Download on App Store
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
