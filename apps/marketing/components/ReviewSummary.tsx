import { Star } from "lucide-react";

interface ReviewSummaryProps {
  rating: number;
  reviewsCount: number;
}

export default function ReviewSummary({ rating, reviewsCount }: ReviewSummaryProps) {
  const bars = [
    { stars: 5, pct: rating >= 4.5 ? 70 : 50 },
    { stars: 4, pct: rating >= 4 ? 20 : 25 },
    { stars: 3, pct: 5 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 2 },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gyg-bg border border-gyg-border flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gyg-navy">{rating.toFixed(1)}</span>
          <span className="text-xs text-gyg-muted">out of 5</span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(rating)
                    ? "fill-gyg-navy text-gyg-navy"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gyg-muted mt-1">Based on {reviewsCount.toLocaleString()} reviews</p>
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {bars.map((bar) => (
          <div key={bar.stars} className="flex items-center gap-3 text-sm">
            <span className="w-3 text-gyg-muted">{bar.stars}</span>
            <Star className="w-3.5 h-3.5 fill-gyg-navy text-gyg-navy" />
            <div className="flex-1 h-2 rounded-full bg-gyg-bg overflow-hidden">
              <div
                className="h-full rounded-full bg-gyg-navy"
                style={{ width: `${bar.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
