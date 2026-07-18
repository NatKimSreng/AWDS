import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviews: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, reviews, size = "sm" }: StarRatingProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <Star className={`${starSize} fill-khmer-gold text-khmer-gold`} />
      <span className="font-semibold text-stone-charcoal">{rating.toFixed(1)}</span>
      <span className="text-stone-gray">({reviews.toLocaleString()})</span>
    </div>
  );
}
