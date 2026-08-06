import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { ShieldCheck, Users, Globe, Heart, Star, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About AngkorWatDayTour — Local Tours in Cambodia",
  description:
    "AngkorWatDayTour connects travelers with verified local guides, drivers, and photographers in Cambodia.",
};

const VALUES = [
  { icon: ShieldCheck, title: "Verified providers", text: "Every guide, driver, and photographer is reviewed before they list." },
  { icon: Users, title: "Local expertise", text: "Book directly with locals who know Cambodia’s temples, food, and hidden gems." },
  { icon: Globe, title: "Instant confirmation", text: "See real-time availability and get your e-ticket in seconds." },
  { icon: Heart, title: "Impact travel", text: "Your booking supports local families and sustainable tourism." },
];

const STATS = [
  { value: "50+", label: "Experiences" },
  { value: "4.9", label: "Average rating" },
  { value: "10k+", label: "Happy travelers" },
  { value: "100%", label: "Local providers" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      {/* Hero */}
      <section className="relative h-64 md:h-80">
        <Image
          src="/images/hero-angkor.jpg"
          alt="Angkor Wat"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gyg-navy/90 to-gyg-blue/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white">
              About AngkorWatDayTour
            </h1>
          </FadeIn>
        </div>
      </section>

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gyg-border shadow-card space-y-4 text-gyg-text">
              <p className="leading-relaxed">
                AngkorWatDayTour is a marketplace that connects visitors to Cambodia with verified local providers — from tuk-tuk drivers and private taxis to expert temple guides and photographers.
              </p>
              <p className="leading-relaxed">
                Our mission is to make it easy for travelers to discover, compare, and book authentic Cambodian experiences while helping local providers grow their businesses.
              </p>
              <p className="leading-relaxed">
                Every listing is reviewed, every booking is confirmed instantly, and every payment is handled securely through the AngkorWatDayTour platform.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-gyg-border p-5 text-center shadow-card"
                >
                  <div className="text-2xl md:text-3xl font-extrabold text-gyg-navy">{stat.value}</div>
                  <div className="text-sm text-gyg-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn>
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gyg-navy mb-6">Why travelers choose us</h2>
              <StaggerContainer className="grid sm:grid-cols-2 gap-5">
                {VALUES.map(({ icon: Icon, title, text }) => (
                  <StaggerItem key={title}>
                    <div className="bg-white rounded-2xl border border-gyg-border p-5 shadow-card hover:shadow-hover transition">
                      <div className="w-10 h-10 rounded-xl bg-gyg-navy/5 text-gyg-navy flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gyg-text mb-1">{title}</h3>
                      <p className="text-sm text-gyg-muted leading-relaxed">{text}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="mt-12 bg-gyg-navy rounded-2xl p-6 md:p-10 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-5 h-5 fill-white" />
                <Star className="w-5 h-5 fill-white" />
                <Star className="w-5 h-5 fill-white" />
                <Star className="w-5 h-5 fill-white" />
                <Star className="w-5 h-5 fill-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to explore Cambodia?</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Find the perfect tour, book in minutes, and make memories that last a lifetime.
              </p>
              <a
                href="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gyg-navy font-bold hover:bg-gyg-bg transition"
              >
                <MapPin className="w-4 h-4" /> Browse tours
              </a>
            </div>
          </FadeIn>
        </div>
      </main>

      <Footer />
    </div>
  );
}
