"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid3X3, ImageOff } from "lucide-react";
import PhotoLightbox from "./PhotoLightbox";

interface TourGalleryProps {
  images: string[];
  title: string;
}

const FALLBACK_IMAGE = "/images/hero-angkor.jpg";

interface GalleryImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

function GalleryImage({ src, alt, className = "", ...props }: GalleryImageProps) {
  const [error, setError] = useState(false);
  const finalSrc = error || !src ? FALLBACK_IMAGE : src;

  return (
    <>
      <Image
        src={finalSrc}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        {...props}
      />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 text-gyg-muted">
          <ImageOff className="w-8 h-8 mb-2" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
    </>
  );
}

export default function TourGallery({ images, title }: TourGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative h-[320px] md:h-[420px] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
          <span className="text-gyg-muted">No images available</span>
        </div>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[320px] md:h-[420px]">
        {images[0] && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden bg-gray-100 block text-left"
          >
            <GalleryImage
              src={images[0]}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition duration-500"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </button>
        )}

        {images.slice(1, 3).map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => openLightbox(idx + 1)}
            className="relative rounded-2xl overflow-hidden bg-gray-100 hidden md:block"
          >
            <GalleryImage
              src={img}
              alt={`${title} gallery ${idx + 2}`}
              fill
              className="object-cover hover:scale-105 transition duration-500"
              sizes="25vw"
            />
          </button>
        ))}

        {images[3] && (
          <button
            type="button"
            onClick={() => openLightbox(3)}
            className="relative rounded-2xl overflow-hidden bg-gray-100 hidden md:block"
          >
            <GalleryImage
              src={images[3]}
              alt={`${title} gallery 4`}
              fill
              className="object-cover hover:scale-105 transition duration-500"
              sizes="25vw"
            />
            {images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full bg-black/40">
                  <Grid3X3 className="w-4 h-4" /> +{images.length - 4} more
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="text-sm font-semibold text-gyg-text underline hover:text-gyg-navy"
        >
          Show all photos
        </button>
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
