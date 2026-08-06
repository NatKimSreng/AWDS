interface StarRatingProps {
  rating: number;
  reviews: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, reviews, size = "sm" }: StarRatingProps) {
  const textSize = size === "sm" ? "text-[11px]" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className="font-medium text-gyg-text">{rating.toFixed(1)}</span>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} text-gyg-text`}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-gyg-muted">({reviews.toLocaleString()})</span>
    </div>
  );
}
