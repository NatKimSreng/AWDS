"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HoverLift } from "./MotionWrapper";

export interface CarouselItem {
  id: number | string;
  name: string;
  slug: string;
  image: string | null;
  badge_color?: string | null;
  subtitle?: string | null;
}

interface ImageCarouselProps {
  items: CarouselItem[];
  linkPrefix: string;
  queryParam: string;
  autoplay?: boolean;
}

export default function ImageCarousel({
  items,
  linkPrefix,
  queryParam,
  autoplay = false,
}: ImageCarouselProps) {
  const plugins = autoplay
    ? [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
    : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: items.length > 3,
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

  if (items.length === 0) return null;

  const fallbackImage = "/images/hero-angkor.jpg";

  return (
    <div className="relative group/carousel mt-6 bg-white rounded-2xl p-1">
      {/* Viewport */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing -mr-2.5" ref={emblaRef}>
        <div className="flex pr-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-0 pr-2.5 flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
            >
              <HoverLift>
                <Link
                  href={`${linkPrefix}?${queryParam}=${item.slug}`}
                  className="group/item relative h-64 md:h-72 rounded-2xl overflow-hidden bg-gray-100 block shadow-card"
                >
                  <Image
                    src={item.image || fallbackImage}
                    alt={item.name}
                    fill
                    className="object-cover group-hover/item:scale-105 transition duration-500"
                    sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, (max-width: 1024px) 33.333vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="font-bold text-base md:text-lg">{item.name}</div>
                    {item.subtitle && (
                      <div className="text-xs text-white/80 mt-1">{item.subtitle}</div>
                    )}
                  </div>
                </Link>
              </HoverLift>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {items.length > 1 && (
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
