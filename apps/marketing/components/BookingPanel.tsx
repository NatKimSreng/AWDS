"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DateSlotPicker from "./DateSlotPicker";
import TrustBadge from "./TrustBadge";
import TravelerSelector from "./TravelerSelector";
import { ShieldCheck, Clock, Users, Globe, Calendar, Zap, ChevronUp } from "lucide-react";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time?: string;
  remaining: number;
  price_override?: string | null;
}

interface BookingPanelProps {
  slug: string;
  title: string;
  basePriceUsd: string | number;
  durationHours: number;
  maxGroup: number;
  languages: string;
  isInstantBook: boolean;
  expanded?: boolean;
  onExpand?: (expanded: boolean) => void;
  onSelectionChange?: (date: string | null, slot: TimeSlot | null, travelers: number) => void;
}

export default function BookingPanel({
  slug,
  title,
  basePriceUsd,
  durationHours,
  maxGroup,
  languages,
  isInstantBook,
  expanded = false,
  onExpand,
  onSelectionChange,
}: BookingPanelProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [travelers, setTravelers] = useState(1);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDate, selectedSlot, travelers);
    }
  }, [selectedDate, selectedSlot, travelers, onSelectionChange]);

  const handleSelect = (date: string, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  const handleTravelersChange = (count: number) => {
    setTravelers(count);
  };

  const unitPrice = selectedSlot?.price_override
    ? Number(selectedSlot.price_override)
    : Number(basePriceUsd);
  const total = unitPrice * travelers;

  const checkoutParams = new URLSearchParams({
    slug,
    title,
    basePrice: Number(basePriceUsd).toFixed(2),
    duration: String(durationHours),
    maxGroup: String(maxGroup),
    timeSlotId: selectedSlot ? String(selectedSlot.id) : "",
    date: selectedDate ?? "",
    startTime: selectedSlot?.start_time ?? "",
    travelers: String(travelers),
    total: total.toFixed(2),
    specialRequests: "",
  });

  const canCheckout = Boolean(selectedSlot && selectedDate);

  return (
    <div className="bg-white rounded-2xl border border-gyg-border shadow-card p-6">
      {/* Price header */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-gyg-muted">From</span>
          <span className="text-3xl font-bold text-gyg-navy">${unitPrice.toFixed(2)}</span>
          <span className="text-sm text-gyg-muted">per person</span>
        </div>
      </div>

      {expanded ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gyg-navy">Select date and availability</h2>
            <button
              type="button"
              onClick={() => onExpand?.(false)}
              className="inline-flex items-center gap-1 text-xs font-medium text-gyg-muted hover:text-angkor-orange"
            >
              Hide <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <DateSlotPicker
            slug={slug}
            basePriceUsd={basePriceUsd}
            onSelect={handleSelect}
          />

          <div className="mt-5 pt-5 border-t border-gyg-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gyg-text">Travelers</span>
              <span className="text-xs text-gyg-muted">Max {maxGroup}</span>
            </div>
            <TravelerSelector value={travelers} min={1} max={maxGroup} onChange={handleTravelersChange} />
          </div>

          {selectedSlot && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gyg-muted">
                {travelers} × ${unitPrice.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-gyg-navy">${total.toFixed(2)}</span>
            </div>
          )}

          {canCheckout ? (
            <Link
              href={`/booking/checkout?${checkoutParams.toString()}`}
              className="mt-5 block w-full text-center rounded-xl bg-angkor-orange hover:bg-angkor-orange-dark text-white px-6 py-4 font-bold text-lg transition"
            >
              Book now
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-5 block w-full text-center rounded-xl bg-gray-100 text-gyg-muted px-6 py-4 font-bold text-lg cursor-not-allowed"
            >
              Select a date and time
            </button>
          )}

          <p className="text-xs text-gyg-muted text-center mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure payment
          </p>

          {isInstantBook && (
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-success-green bg-green-50 rounded-lg px-3 py-2">
              <Zap className="w-4 h-4" /> Instant confirmation
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onExpand?.(true)}
          className="w-full text-center rounded-xl bg-angkor-orange hover:bg-angkor-orange-dark text-white px-6 py-4 font-bold text-lg transition"
        >
          Check availability
        </button>
      )}

      <div className="mt-6 pt-5 border-t border-gyg-border space-y-4">
        <TrustBadge
          icon={Calendar}
          title="Free cancellation"
          body="Cancel up to 24 hours before for a full refund."
        />
        <TrustBadge
          icon={Clock}
          title={`${durationHours} hours`}
          body="Duration listed by the provider."
        />
        <TrustBadge
          icon={Users}
          title={`Up to ${maxGroup} travelers`}
          body="Small group experience."
        />
        <TrustBadge
          icon={Globe}
          title={languages}
          body="Languages spoken by your provider."
        />
      </div>
    </div>
  );
}