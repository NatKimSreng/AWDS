"use client";

import { Suspense, useEffect } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createGuestBooking, fetchActivity } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutSummary from "@/components/CheckoutSummary";
import { ChevronLeft, Loader2, ShieldCheck, CreditCard, Smartphone, Calendar, Clock, Users, MapPin } from "lucide-react";

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();

  const slug = params.get("slug") ?? "";
  const title = params.get("title") ?? "";
  const basePrice = params.get("basePrice") ?? "0";
  const duration = params.get("duration") ?? "0";
  const timeSlotId = parseInt(params.get("timeSlotId") ?? "0", 10);
  const date = params.get("date") ?? "";
  const startTime = params.get("startTime") ?? "";
  const travelers = parseInt(params.get("travelers") ?? "1", 10);
  const total = params.get("total") ?? "0";
  const specialRequests = params.get("specialRequests") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchActivity(slug)
      .then((data) => {
        if (cancelled || !data) return;
        setHeroImage((data as { hero_image?: string | null }).hero_image ?? null);
        setProvider(
          (data as { provider?: { business_name?: string } | null }).provider
            ?.business_name ?? null
        );
      })
      .catch(() => {
        // non-fatal: summary still renders with query-string values
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const isValid =
    name.trim() &&
    email.trim() &&
    timeSlotId > 0 &&
    travelers >= 1 &&
    agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const booking = await createGuestBooking({
        time_slot_id: timeSlotId,
        traveler_count: travelers,
        currency: "USD",
        special_requests: specialRequests || undefined,
        guest_name: name.trim(),
        guest_email: email.trim(),
        guest_phone: phone.trim() || undefined,
      });

      router.push(
        `/booking/payment?bookingRef=${encodeURIComponent(booking.booking_ref)}&guestEmail=${encodeURIComponent(booking.guest_email)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!slug || !title || !timeSlotId || !date || !startTime) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
          <div className="bg-white rounded-2xl border border-gyg-border p-8 text-center">
            <h1 className="text-xl font-bold text-gyg-navy mb-2">Booking session expired</h1>
            <p className="text-gyg-muted mb-4">Please start your booking again from the tour page.</p>
            <Link
              href="/tours"
              className="inline-block px-6 py-3 rounded-xl bg-angkor-orange text-white font-semibold hover:bg-angkor-orange-dark transition"
            >
              Browse tours
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-sand-bg">
      <Header />

      <main className="flex-1 w-full">
        <div className="bg-white border-b border-gyg-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <Link
              href={`/tours/${slug}`}
              className="inline-flex items-center gap-1 text-sm text-gyg-muted hover:text-angkor-orange mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to tour
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gyg-navy">Checkout</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
            {/* Left: form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mobile booking details strip (summary lives in right column on desktop) */}
              <div className="bg-white rounded-2xl p-5 border border-gyg-border lg:hidden">
                <h2 className="text-sm font-bold text-gyg-navy mb-3">Booking details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gyg-text">
                    <Calendar className="w-3.5 h-3.5 text-gyg-muted" />
                    <span className="font-medium">{date}</span>
                    <Clock className="w-3.5 h-3.5 text-gyg-muted ml-2" />
                    <span className="font-medium">{startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gyg-muted">
                    <Users className="w-3.5 h-3.5" />
                    {travelers} {travelers === 1 ? "traveler" : "travelers"}
                    <MapPin className="w-3.5 h-3.5 ml-2" />
                    {parseInt(duration, 10)}h
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gyg-border">
                    <span className="text-gyg-muted">Total</span>
                    <span className="font-bold text-angkor-orange">${Number(total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 md:p-6 border border-gyg-border">
                <h2 className="text-lg font-bold text-gyg-navy mb-4">Contact details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gyg-text mb-1">
                      Full name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="As shown on ID"
                      className="w-full rounded-xl border border-gyg-border px-4 py-3 text-gyg-text outline-none focus:border-angkor-orange"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gyg-text mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gyg-border px-4 py-3 text-gyg-text outline-none focus:border-angkor-orange"
                    />
                    <p className="text-xs text-gyg-muted mt-1">Your booking confirmation will be sent here.</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gyg-text mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+855 12 345 678"
                      className="w-full rounded-xl border border-gyg-border px-4 py-3 text-gyg-text outline-none focus:border-angkor-orange"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 md:p-6 border border-gyg-border">
                <h2 className="text-lg font-bold text-gyg-navy mb-4">Payment method</h2>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-angkor-orange bg-angkor-orange-light">
                  <Smartphone className="w-5 h-5 text-angkor-orange" />
                  <div className="flex-1">
                    <div className="font-semibold text-gyg-text">KHQR (Bakong)</div>
                    <div className="text-xs text-gyg-muted">Scan with any Bakong-supported app to pay</div>
                  </div>
                  <span className="text-xs font-semibold text-angkor-orange">Selected</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-angkor-orange border-gyg-border rounded focus:ring-angkor-orange"
                />
                <label htmlFor="terms" className="text-sm text-gyg-muted">
                  I agree to the{" "}
                  <Link href="/terms" className="text-angkor-orange hover:underline">Terms of Service</Link>
                  ,{" "}
                  <Link href="/cancellation" className="text-angkor-orange hover:underline">
                    cancellation policy
                  </Link>
                  , and provider guidelines.
                </label>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 text-error-red p-4 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-lg transition ${
                  isValid && !loading
                    ? "bg-angkor-orange hover:bg-angkor-orange-dark text-white"
                    : "bg-gray-100 text-gyg-muted cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Book now — ${Number(total).toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-gyg-muted text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure payment. Your booking is held for 15 minutes.
              </p>
            </form>

            {/* Right: sticky order summary */}
            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-24">
                <CheckoutSummary
                  title={title}
                  image={heroImage}
                  provider={provider}
                  date={date}
                  startTime={startTime}
                  travelers={travelers}
                  basePrice={basePrice}
                  total={total}
                  duration={parseInt(duration, 10)}
                  specialRequests={specialRequests || undefined}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-sand-bg">
      <Header />
      <main className="flex-1 w-full flex items-center justify-center">
        <div className="text-gyg-muted">Loading checkout…</div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CheckoutForm />
    </Suspense>
  );
}
