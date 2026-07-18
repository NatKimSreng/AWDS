import Link from "next/link";
import { Clock, Users, MapPin, Zap } from "lucide-react";
import StarRating from "./StarRating";
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
  featured?: boolean;
}

export default function TourCard({
  slug,
  title,
  base_price_usd,
  duration_minutes,
  max_group,
  avg_rating,
  reviews_count,
  is_featured,
  is_instant_book,
  category,
  city,
  hero_image,
  provider,
  featured,
}: TourCardProps) {
  const durationHours = Math.round(duration_minutes / 60);
  const price = Number(base_price_usd).toFixed(2);
  const badge = is_featured || featured;

  return (
    <Link
      href={`/tours/${slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gyg-border shadow-card hover:shadow-hover hover:-translate-y-1 transition duration-300"
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <TourImage
          src={hero_image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {badge && (
            <span className="bg-angkor-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Featured
            </span>
          )}
          {is_instant_book && (
            <span className="bg-gyg-navy text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Instant
            </span>
          )}
        </div>

        {category && (
          <span className="absolute bottom-3 left-3 bg-white/95 text-gyg-text text-xs font-semibold px-2.5 py-1 rounded-full">
            {category.name}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-gyg-text text-base leading-snug line-clamp-2 mb-2 group-hover:text-angkor-orange transition">
          {title}
        </h3>

        <div className="mb-3">
          <StarRating rating={avg_rating} reviews={reviews_count} />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gyg-muted mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {durationHours}h
          </span>
          {max_group && max_group > 1 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Up to {max_group}
            </span>
          )}
          {city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {city.name}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-50">
          <div className="text-xs text-gyg-muted">
            {provider?.business_name ?? "Verified provider"}
          </div>
          <div className="text-right">
            <div className="text-xs text-gyg-muted">From</div>
            <div className="text-lg font-bold text-angkor-orange">${price}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
