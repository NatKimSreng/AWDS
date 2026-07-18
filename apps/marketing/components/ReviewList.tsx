"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  author: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  perPage?: number;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(d);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ReviewList({ reviews, perPage = 5 }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const total = reviews.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageReviews = reviews.slice(start, start + perPage);

  if (total === 0) return null;

  const from = start + 1;
  const to = Math.min(start + perPage, total);

  // Page number window (show up to 5 around the current page)
  const pageNumbers: number[] = [];
  const window = 2;
  const minPage = Math.max(1, currentPage - window);
  const maxPage = Math.min(totalPages, currentPage + window);
  for (let p = minPage; p <= maxPage; p++) pageNumbers.push(p);

  return (
    <div>
      <p className="text-sm text-gyg-muted mb-4">
        Showing {from}–{to} of {total} reviews
      </p>

      <div className="space-y-4">
        {pageReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl border border-gyg-border shadow-card p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-11 h-11 rounded-full bg-angkor-orange-light flex items-center justify-center">
                <span className="text-sm font-bold text-angkor-orange">
                  {initials(review.author || "A")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-gyg-text">{review.author}</span>
                  <span className="flex items-center gap-1 text-khmer-gold text-sm">
                    <Star className="w-4 h-4 fill-khmer-gold" /> {review.rating}.0
                  </span>
                </div>
                {review.created_at && (
                  <p className="text-xs text-gyg-muted mt-0.5">{formatDate(review.created_at)}</p>
                )}
                <p className="text-sm text-gyg-text leading-relaxed mt-3">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gyg-border text-sm font-medium text-gyg-text hover:border-angkor-orange hover:text-angkor-orange disabled:opacity-40 disabled:hover:border-gyg-border disabled:hover:text-gyg-text transition"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {minPage > 1 && (
            <>
              <button
                type="button"
                onClick={() => setPage(1)}
                className="w-9 h-9 rounded-lg text-sm font-medium text-gyg-text hover:bg-gyg-bg"
              >
                1
              </button>
              {minPage > 2 && <span className="px-1 text-gyg-muted">…</span>}
            </>
          )}

          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                p === currentPage
                  ? "bg-angkor-orange text-white"
                  : "text-gyg-text hover:bg-gyg-bg"
              }`}
            >
              {p}
            </button>
          ))}

          {maxPage < totalPages && (
            <>
              {maxPage < totalPages - 1 && <span className="px-1 text-gyg-muted">…</span>}
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className="w-9 h-9 rounded-lg text-sm font-medium text-gyg-text hover:bg-gyg-bg"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gyg-border text-sm font-medium text-gyg-text hover:border-angkor-orange hover:text-angkor-orange disabled:opacity-40 disabled:hover:border-gyg-border disabled:hover:text-gyg-text transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}