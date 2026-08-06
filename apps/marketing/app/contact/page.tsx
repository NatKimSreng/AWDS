import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { Mail, Clock, MapPin, Phone, MessageCircle, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact AngkorWatDayTour",
  description: "Get in touch with the AngkorWatDayTour team for support, partnerships, or media inquiries.",
};

const CONTACTS = [
  { icon: Mail, label: "Email us", value: "hello@angkorwatdaytour.com", href: "mailto:hello@angkorwatdaytour.com" },
  { icon: Phone, label: "Call us", value: "+855 63 123 456", href: "tel:+85563123456" },
  { icon: Clock, label: "Support hours", value: "8:00 AM – 8:00 PM ICT, 7 days" },
  { icon: MapPin, label: "Office", value: "Siem Reap, Cambodia" },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      <section className="relative h-56 md:h-72">
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
            <h1 className="text-3xl md:text-5xl font-extrabold text-white">Contact us</h1>
          </FadeIn>
        </div>
      </section>

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-[1fr_360px] gap-8">
            <FadeIn>
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gyg-border shadow-card">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gyg-navy/5 text-gyg-navy flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gyg-navy">Send us a message</h2>
                    <p className="text-sm text-gyg-muted">We’ll get back to you within 24 hours.</p>
                  </div>
                </div>

                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gyg-text mb-1">Name</label>
                      <input type="text" className="w-full rounded-xl border border-gyg-border px-4 py-2.5 text-sm outline-none focus:border-gyg-navy" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gyg-text mb-1">Email</label>
                      <input type="email" className="w-full rounded-xl border border-gyg-border px-4 py-2.5 text-sm outline-none focus:border-gyg-navy" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gyg-text mb-1">Message</label>
                    <textarea rows={5} className="w-full rounded-xl border border-gyg-border px-4 py-3 text-sm outline-none focus:border-gyg-navy resize-none" placeholder="How can we help?" />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gyg-navy text-white font-semibold hover:bg-black transition"
                  >
                    <Send className="w-4 h-4" /> Send message
                  </button>
                </form>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="space-y-4">
                <StaggerContainer className="space-y-4">
                  {CONTACTS.map(({ icon: Icon, label, value, href }) => (
                    <StaggerItem key={label}>
                      <div className="bg-white rounded-2xl border border-gyg-border p-5 shadow-card flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gyg-navy/5 text-gyg-navy flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gyg-muted uppercase tracking-wide">{label}</div>
                          {href ? (
                            <a href={href} className="text-gyg-navy font-semibold hover:underline">{value}</a>
                          ) : (
                            <div className="text-gyg-text font-medium">{value}</div>
                          )}
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
