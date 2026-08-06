"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TourCard from "./TourCard";

interface Activity {
  id: number;
  slug: string;
  title: string;
  base_price_usd: string;
  duration_minutes: number;
  min_group: number;
  max_group: number;
  avg_rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_instant_book: boolean;
  category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
  provider: { business_name: string; avg_rating?: number } | null;
  hero_image: string | null;
}

interface TourCarouselProps {
  activities: Activity[];
  featured?: boolean;
  autoplay?: boolean;
}

export default function TourCarousel({
  activities,
  featured = false,
  autoplay = false,
}: TourCarouselProps) {
  const plugins = autoplay
    ? [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
    : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: activities.length > 3,
      skipSnaps: false,
      dragFree: false,
    },
    plugins
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (activities.length === 0) return null;

  return (
    <div className="relative group/carousel mt-6 bg-white rounded-2xl p-1">
      {/* Viewport */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing -mr-2.5" ref={emblaRef}>
        <div className="flex pr-2.5">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="min-w-0 pr-2.5 flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
            >
              <TourCard {...activity} featured={featured} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {activities.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white border border-gyg-border shadow-card flex items-center justify-center text-gyg-text hover:border-gyg-navy hover:text-gyg-navy transition disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white border border-gyg-border shadow-card flex items-center justify-center text-gyg-text hover:border-gyg-navy hover:text-gyg-navy transition disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
