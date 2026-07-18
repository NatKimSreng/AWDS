"use client";

import { useState } from "react";
import BookingPanel from "./BookingPanel";
import MobileBookingBar from "./MobileBookingBar";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time?: string;
  remaining: number;
  price_override?: string | null;
}

interface BookingSectionProps {
  slug: string;
  title: string;
  basePriceUsd: string | number;
  durationHours: number;
  maxGroup: number;
  languages: string;
  isInstantBook: boolean;
}

export default function BookingSection(props: BookingSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [travelers, setTravelers] = useState(1);

  const handleSelectionChange = (
    date: string | null,
    slot: TimeSlot | null,
    count: number
  ) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setTravelers(count);
  };

  const unitPrice = selectedSlot?.price_override
    ? Number(selectedSlot.price_override)
    : Number(props.basePriceUsd);
  const total = unitPrice * travelers;

  let checkoutHref: string | undefined;
  let ctaText: string;

  if (expanded && selectedSlot && selectedDate) {
    const params = new URLSearchParams({
      slug: props.slug,
      title: props.title,
      basePrice: Number(props.basePriceUsd).toFixed(2),
      duration: String(props.durationHours),
      maxGroup: String(props.maxGroup),
      timeSlotId: String(selectedSlot.id),
      date: selectedDate,
      startTime: selectedSlot.start_time,
      travelers: String(travelers),
      total: total.toFixed(2),
      specialRequests: "",
    });
    checkoutHref = `/booking/checkout?${params.toString()}`;
    ctaText = "Book now";
  } else if (expanded) {
    ctaText = "Select a date and time";
  } else {
    ctaText = "Check availability";
  }

  const handleMobileCta = () => {
    if (expanded && selectedSlot && selectedDate) {
      // Navigation handled by href
      return;
    }
    if (!expanded) {
      setExpanded(true);
      document
        .getElementById("booking-widget")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      document
        .getElementById("booking-widget")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      <div id="booking-widget">
        <BookingPanel
          {...props}
          expanded={expanded}
          onExpand={setExpanded}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <MobileBookingBar
        basePriceUsd={props.basePriceUsd}
        href={checkoutHref}
        ctaText={ctaText}
        onCheckAvailability={handleMobileCta}
      />
    </>
  );
}