"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { generateGuestKhqr, checkGuestKhqrStatus } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, ChevronLeft, Clock, Smartphone } from "lucide-react";

function PaymentForm() {
  const router = useRouter();
  const params = useSearchParams();

  const bookingRef = params.get("bookingRef") ?? "";
  const guestEmail = params.get("guestEmail") ?? "";

  const [qr, setQr] = useState<string | null>(null);
  const [amount, setAmount] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "paid" | "error">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!bookingRef || !guestEmail) return;

    let cancelled = false;

    generateGuestKhqr(bookingRef, guestEmail)
      .then((data) => {
        if (cancelled) return;
        setQr(data.qr);
        setAmount(String(data.amount));
        setCurrency(data.currency);
        setPaymentId(data.payment_id);
        setExpiresAt(data.expires_at);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load payment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingRef, guestEmail]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Expired");
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Poll payment status
  useEffect(() => {
    if (!paymentId || !bookingRef || status !== "pending") return;

    let cancelled = false;

    const check = async () => {
      try {
        const result = await checkGuestKhqrStatus(paymentId, bookingRef);
        if (cancelled) return;

        if (result.status === "paid" || result.booking_status === "confirmed") {
          setStatus("paid");
          router.push(
            `/booking/confirmation?bookingRef=${encodeURIComponent(bookingRef)}&guestEmail=${encodeURIComponent(guestEmail)}`
          );
        }
      } catch {
        // Ignore polling errors
      }
    };

    check();
    const interval = setInterval(check, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paymentId, bookingRef, guestEmail, status, router]);

  const handleManualCheck = async () => {
    if (!paymentId || !bookingRef) return;
    setLoading(true);
    try {
      const result = await checkGuestKhqrStatus(paymentId, bookingRef);
      if (result.status === "paid" || result.booking_status === "confirmed") {
        setStatus("paid");
        router.push(
          `/booking/confirmation?bookingRef=${encodeURIComponent(bookingRef)}&guestEmail=${encodeURIComponent(guestEmail)}`
        );
      } else {
        setStatus("pending");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status check failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingRef || !guestEmail) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
          <div className="bg-white rounded-2xl border border-gyg-border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-error-red mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gyg-navy mb-2">Payment session expired</h1>
            <Link href="/tours" className="text-angkor-orange font-semibold hover:underline">
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
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
            <Link
              href={`/booking/confirmation?bookingRef=${encodeURIComponent(bookingRef)}&guestEmail=${encodeURIComponent(guestEmail)}`}
              className="inline-flex items-center gap-1 text-sm text-gyg-muted hover:text-angkor-orange mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to booking
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gyg-navy">Complete payment</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Compact order summary strip */}
          <div className="bg-white rounded-2xl border border-gyg-border shadow-card p-4 mb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-angkor-orange-light flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-angkor-orange" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gyg-text">KHQR (Bakong)</div>
                  <div className="text-xs text-gyg-muted">Booking ref: {bookingRef}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gyg-muted">Total to pay</div>
                <div className="text-lg font-bold text-angkor-orange">
                  ${Number(amount).toFixed(2)} {currency}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gyg-border shadow-card text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-angkor-orange" />
              <span className="text-sm font-semibold text-gyg-text">Time remaining: {countdown || "--:--"}</span>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gyg-muted">Total to pay</span>
              <div className="text-3xl font-bold text-gyg-navy">
                ${Number(amount).toFixed(2)} {currency}
              </div>
            </div>

            {loading ? (
              <div className="py-12">
                <Loader2 className="w-10 h-10 text-angkor-orange animate-spin mx-auto mb-3" />
                <p className="text-gyg-muted">Loading KHQR...</p>
              </div>
            ) : error ? (
              <div className="py-8">
                <AlertCircle className="w-12 h-12 text-error-red mx-auto mb-3" />
                <p className="text-error-red mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 rounded-lg border border-gyg-border text-gyg-text hover:border-angkor-orange hover:text-angkor-orange transition"
                >
                  Retry
                </button>
              </div>
            ) : qr ? (
              <>
                <div className="relative w-64 h-64 mx-auto mb-6 bg-white p-3 rounded-xl border border-gyg-border shadow-sm">
                  <Image
                    src={qr}
                    alt="KHQR payment code"
                    fill
                    className="object-contain p-2"
                    sizes="256px"
                  />
                </div>

                <p className="text-sm text-gyg-muted mb-6">
                  Open your Bakong app, scan the QR code, and come back here.
                </p>

                {status === "paid" ? (
                  <div className="flex items-center justify-center gap-2 text-success-green font-semibold">
                    <CheckCircle2 className="w-5 h-5" /> Payment received
                  </div>
                ) : (
                  <button
                    onClick={handleManualCheck}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-angkor-orange text-white font-semibold hover:bg-angkor-orange-dark transition disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" /> I&#39;ve completed the payment
                      </>
                    )}
                  </button>
                )}
              </>
            ) : null}
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
        <div className="text-gyg-muted">Loading payment…</div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <PaymentForm />
    </Suspense>
  );
}
