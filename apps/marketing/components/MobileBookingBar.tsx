"use client";

import Link from "next/link";
import { Star } from "lucide-react";

interface MobileBookingBarProps {
  basePriceUsd: string | number;
  href?: string;
  ctaText?: string;
  onCheckAvailability?: () => void;
}

export default function MobileBookingBar({
  basePriceUsd,
  href,
  ctaText = "Check availability",
  onCheckAvailability,
}: MobileBookingBarProps) {
  const price = Number(basePriceUsd).toFixed(2);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gyg-border px-4 py-3 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-gyg-muted flex items-center gap-1">
            From <span className="font-semibold text-gyg-navy">${price}</span> per person
          </div>
          <div className="text-xs text-success-green flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-current" /> Free cancellation
          </div>
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 rounded-xl bg-angkor-orange hover:bg-angkor-orange-dark text-white px-6 py-3 font-bold text-sm transition"
          >
            {ctaText}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCheckAvailability ?? (() => window.scrollTo({ top: 0, behavior: "smooth" }))}
            className="shrink-0 rounded-xl bg-angkor-orange hover:bg-angkor-orange-dark text-white px-6 py-3 font-bold text-sm transition"
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}