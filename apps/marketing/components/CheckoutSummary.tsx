import TourImage from "./TourImage";
import { Calendar, Clock, Users, MapPin, ShieldCheck, CalendarX } from "lucide-react";

interface CheckoutSummaryProps {
  title: string;
  image?: string | null;
  provider?: string | null;
  date?: string;
  startTime?: string;
  travelers?: number;
  basePrice?: string;
  total?: string;
  currency?: string;
  specialRequests?: string;
  duration?: number;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function participantsLabel(count?: number) {
  if (!count) return "";
  return `${count} ${count === 1 ? "adult" : "adults"}`;
}

export default function CheckoutSummary({
  title,
  image,
  provider,
  date,
  startTime,
  travelers,
  basePrice,
  total,
  currency = "USD",
  specialRequests,
  duration,
}: CheckoutSummaryProps) {
  const numericBase = basePrice ? Number(basePrice) : 0;
  const numericTotal = total ? Number(total) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gyg-border shadow-card overflow-hidden">
      {/* Tour image + title header */}
      <div className="relative">
        <div className="relative h-36 w-full bg-gray-100">
          <TourImage
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="380px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gyg-navy/80 via-gyg-navy/10 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-bold text-white leading-tight line-clamp-2 drop-shadow">
            {title}
          </h3>
          {provider && (
            <p className="text-xs text-white/80 mt-0.5">by {provider}</p>
          )}
        </div>
      </div>

      <div className="p-5 md:p-6">
        {/* Booking details line items */}
        <div className="space-y-3 text-sm">
          {date && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gyg-muted flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5" /> Date
              </span>
              <span className="font-semibold text-gyg-text text-right">{formatDate(date)}</span>
            </div>
          )}
          {startTime && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gyg-muted flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" /> Start time
              </span>
              <span className="font-semibold text-gyg-text">{startTime}</span>
            </div>
          )}
          {duration ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gyg-muted flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5" /> Duration
              </span>
              <span className="font-semibold text-gyg-text">{duration}h</span>
            </div>
          ) : null}
          {typeof travelers === "number" && travelers > 0 && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gyg-muted flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5" /> Participants
              </span>
              <span className="font-semibold text-gyg-text">{participantsLabel(travelers)}</span>
            </div>
          )}

          {specialRequests && (
            <div className="pt-2 border-t border-gyg-border">
              <span className="text-gyg-muted block mb-1">Special requests</span>
              <p className="text-gyg-text">{specialRequests}</p>
            </div>
          )}
        </div>

        {/* Price breakdown */}
        <div className="mt-4 pt-4 border-t border-gyg-border space-y-2">
          {travelers && numericBase > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gyg-muted">
                {travelers} × ${numericBase.toFixed(2)}
              </span>
              <span className="text-gyg-text font-medium">${(travelers * numericBase).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-bold text-gyg-navy">Total</span>
            <span className="text-2xl font-bold text-angkor-orange">
              ${numericTotal.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-4 pt-4 border-t border-gyg-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-success-green font-medium">
            <CalendarX className="w-3.5 h-3.5" />
            Free cancellation up to 24h before
          </div>
          <div className="flex items-center gap-2 text-xs text-gyg-muted font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Reserve now &amp; pay later
          </div>
        </div>
      </div>
    </div>
  );
}