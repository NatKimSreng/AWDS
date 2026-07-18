"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  fetchGuestBooking,
  fetchGuestTicket,
  sendGuestConfirmationEmail,
  type GuestBookingResponse,
  type GuestTicketResponse,
} from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TicketCard from "@/components/TicketCard";
import { Loader2, Mail, Printer, AlertCircle, CheckCircle2 } from "lucide-react";

function ConfirmationContent() {
  const params = useSearchParams();
  const bookingRef = params.get("bookingRef") ?? "";
  const guestEmail = params.get("guestEmail") ?? "";

  const [ticket, setTicket] = useState<GuestTicketResponse | null>(null);
  const [booking, setBooking] = useState<GuestBookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!bookingRef || !guestEmail) return;

    let cancelled = false;

    Promise.all([
      fetchGuestBooking(bookingRef),
      fetchGuestTicket(bookingRef, guestEmail).catch(() => null),
    ])
      .then(([bookingData, ticketData]) => {
        if (cancelled) return;
        setBooking(bookingData);
        setTicket(ticketData);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load booking.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingRef, guestEmail]);

  const handleEmailConfirmation = async () => {
    if (!bookingRef || !guestEmail) return;
    setSendingEmail(true);
    try {
      await sendGuestConfirmationEmail(bookingRef, guestEmail);
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!bookingRef || !guestEmail) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
          <div className="bg-white rounded-2xl border border-gyg-border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-error-red mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gyg-navy mb-2">Booking reference missing</h1>
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
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-success-green mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-gyg-navy">Booking confirmed!</h1>
            <p className="text-gyg-muted mt-1">
              Reference:{" "}
              <span className="font-semibold text-gyg-text">{bookingRef}</span>
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-angkor-orange animate-spin mx-auto mb-3" />
              <p className="text-gyg-muted">Loading your ticket...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-error-red rounded-xl p-4 text-sm mb-6">{error}</div>
          ) : ticket ? (
            <div className="space-y-6">
              <TicketCard
                ticketRef={ticket.ticket_ref}
                bookingRef={ticket.booking_ref}
                activity={ticket.activity}
                provider={ticket.provider}
                date={ticket.date}
                time={ticket.time}
                travelers={ticket.travelers}
                totalPrice={ticket.total_price}
                currency={ticket.currency}
                qrDataUri={ticket.qr_data_uri}
                status={ticket.booking_status}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={handleEmailConfirmation}
                  disabled={sendingEmail || emailSent}
                  className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
                    emailSent
                      ? "bg-green-50 text-success-green"
                      : "bg-white border border-gyg-border text-gyg-text hover:border-angkor-orange hover:text-angkor-orange"
                  }`}
                >
                  {sendingEmail ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : emailSent ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Email sent
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" /> Email confirmation
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold bg-white border border-gyg-border text-gyg-text hover:border-angkor-orange hover:text-angkor-orange transition"
                >
                  <Printer className="w-5 h-5" /> Print / save
                </button>
              </div>

              {booking?.status === "pending" && (
                <div className="bg-khmer-gold/10 border border-khmer-gold/30 rounded-xl p-4 text-sm text-gyg-text">
                  Payment is still pending. Complete payment to receive your final e-ticket.
                </div>
              )}

              <div className="text-center">
                <Link
                  href="/tours"
                  className="text-angkor-orange font-semibold hover:underline"
                >
                  Explore more tours
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gyg-border p-8 text-center">
              <p className="text-gyg-muted">Your booking is confirmed, but the ticket is not ready yet.</p>
              {booking && (
                <div className="mt-4 text-left max-w-sm mx-auto text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gyg-muted">Tour</span>
                    <span className="font-medium">{booking.activity?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gyg-muted">Total</span>
                    <span className="font-medium">${Number(booking.total_price).toFixed(2)} {booking.currency}</span>
                  </div>
                </div>
              )}
            </div>
          )}
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
        <div className="text-gyg-muted">Loading confirmation…</div>
      </main>
      <Footer />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ConfirmationContent />
    </Suspense>
  );
}
