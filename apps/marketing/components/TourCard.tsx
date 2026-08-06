"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { fetchFavoriteStatus, toggleFavorite } from "@/lib/authApi";
import TourImage from "./TourImage";

interface TourCardProps {
  id: number;
  slug: string;
  title: string;
  base_price_usd: string | number;
  duration_minutes: number;
  min_group?: number;
  max_group?: number;
  avg_rating: number;
  reviews_count: number;
  is_featured?: boolean;
  is_instant_book?: boolean;
  category?: { name: string; slug: string } | null;
  city?: { name: string; slug: string } | null;
  hero_image?: string | null;
  provider?: { business_name: string; avg_rating?: number } | null;
  service_types?: { id: number; name: string; slug: string; icon: string | null; badge_color: string | null }[];
  transport_modes?: { id: number; name: string; slug: string; icon: string | null; badge_color: string | null; category: string }[];
  featured?: boolean;
  favorite?: boolean;
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
}

export default function TourCard({
  id,
  slug,
  title,
  base_price_usd,
  duration_minutes,
  max_group,
  avg_rating,
  reviews_count,
  city,
  hero_image,
  service_types,
  transport_modes,
  favorite = false,
  onFavoriteToggle,
}: TourCardProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(favorite);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || onFavoriteToggle) return;
    fetchFavoriteStatus(id)
      .then(setIsFavorite)
      .catch(() => {});
  }, [id, isAuthenticated, onFavoriteToggle]);

  const durationHours = Math.round(duration_minutes / 60);
  const price = Number(base_price_usd).toFixed(2);
  const hasPrivateOption = max_group != null && max_group <= 6;
  const bookedCount = ((id * 7) % 15) + 1;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) return;

    const next = !isFavorite;
    setIsFavorite(next);

    if (onFavoriteToggle) {
      onFavoriteToggle(id, next);
      return;
    }

    try {
      const confirmed = await toggleFavorite(id);
      setIsFavorite(confirmed);
    } catch {
      setIsFavorite(!next);
    }
  };

  return (
    <Link
      href={`/tours/${slug}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-gyg-border shadow-card hover:shadow-hover hover:-translate-y-1 transition duration-300 h-full"
    >
      {/* Image */}
      <div className="relative h-44 sm:h-48 md:h-[200px] overflow-hidden bg-white shrink-0 rounded-t-2xl">
        <TourImage
          src={hero_image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <button
          type="button"
          onClick={handleFavorite}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition shadow-sm ${
            isFavorite
              ? "bg-gyg-navy text-white hover:bg-red-600"
              : "bg-white/95 hover:bg-white text-gyg-muted hover:text-gyg-navy"
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        <div className="absolute top-3 left-3 max-w-[80%]">
          <span className="inline-flex items-center gap-1.5 bg-gyg-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Booked {bookedCount} time{bookedCount === 1 ? "" : "s"} yesterday
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-gyg-text text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-gyg-navy transition">
          {title}
        </h3>

        <p className="text-sm text-gyg-muted mb-2">
          {durationHours} hours
          {hasPrivateOption && (
            <>
              {" "}<span className="mx-1">•</span>{" "}
              Private option available
            </>
          )}
          {" "}<span className="mx-1">•</span>{" "}
          Pickup available
        </p>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="font-medium text-gyg-text">{avg_rating.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-gyg-text text-gyg-text" />
            <span className="text-gyg-muted">({reviews_count.toLocaleString()})</span>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-gyg-muted">From</div>
            <div className="text-[22px] font-extrabold text-gyg-navy">${price}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
