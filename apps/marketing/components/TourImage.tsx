"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK = "/images/hero-angkor.jpg";

interface TourImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Wraps next/image with a graceful fallback to a local image when the remote
 * tour photo (e.g. an Unsplash URL) is missing or 404s.
 */
export default function TourImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
}: TourImageProps) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? FALLBACK : src;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setErrored(true)}
    />
  );
}