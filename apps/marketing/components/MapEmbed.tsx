interface MapEmbedProps {
  lat: number;
  lng: number;
  label?: string;
  zoom?: number;
  className?: string;
}

/**
 * Keyless embedded map (OpenStreetMap). No API key or client-side dependency
 * required — renders an iframe centered on the given coordinates with a marker.
 */
export default function MapEmbed({
  lat,
  lng,
  label,
  zoom = 0.01,
  className = "h-64 w-full rounded-xl overflow-hidden border border-gyg-border",
}: MapEmbedProps) {
  const delta = zoom;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;

  const directionsHref = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="space-y-2">
      <iframe
        title={label ?? "Meeting point map"}
        src={src}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-angkor-orange hover:underline"
      >
        Open in OpenStreetMap →
      </a>
    </div>
  );
}