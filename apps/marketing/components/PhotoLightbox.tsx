"use client";

import { useEffect, useCallback, useState } from "react";
import TourImage from "./TourImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function PhotoLightbox({
  images,
  initialIndex,
  onClose,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-white text-sm">
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-white hover:bg-white/20"
          aria-label="Close gallery"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 relative flex items-center justify-center">
        <button
          onClick={goPrev}
          className="absolute left-2 sm:left-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
          <TourImage
            src={images[index]}
            alt={`Gallery image ${index + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        <button
          onClick={goNext}
          className="absolute right-2 sm:right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
