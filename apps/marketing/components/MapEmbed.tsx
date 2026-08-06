interface MapEmbedProps {
  lat?: number;
  lng?: number;
  address?: string | null;
  googleMapsEmbedUrl?: string;
  googleMapsUrl?: string;
  openStreetMapUrl?: string;
  className?: string;
  height?: string;
}

/**
 * Embedded map for a meeting point. Prefers a Google Maps embed URL when the
 * backend provides one; otherwise falls back to an OpenStreetMap iframe built
 * from lat/lng. Styled like GetYourGuide: rounded corners, subtle border, and
 * a "Get directions" link below.
 */
export default function MapEmbed({
  lat,
  lng,
  address,
  googleMapsEmbedUrl,
  googleMapsUrl,
  openStreetMapUrl,
  className = "w-full rounded-xl overflow-hidden border border-gyg-border bg-gyg-bg",
  height = "h-64 md:h-80",
}: MapEmbedProps) {
  let embedSrc: string | null = null;

  if (googleMapsEmbedUrl) {
    embedSrc = googleMapsEmbedUrl;
  } else if (lat != null && lng != null) {
    const delta = 0.01;
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
    embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox
    )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
  }

  const directionsHref =
    googleMapsUrl ??
    openStreetMapUrl ??
    (lat != null && lng != null
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
      : null);

  return (
    <div className="space-y-3">
      {embedSrc ? (
        <iframe
          title={address ? `Map: ${address}` : "Meeting point map"}
          src={embedSrc}
          className={`${className} ${height}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div
          className={`${className} ${height} flex items-center justify-center text-sm text-gyg-muted`}
        >
          Map location unavailable.
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        {address ? (
          <p className="text-gyg-text font-medium">{address}</p>
        ) : (
          <p className="text-gyg-muted">Exact location confirmed after booking.</p>
        )}
        {directionsHref && (
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gyg-navy hover:underline shrink-0"
          >
            Get directions →
          </a>
        )}
      </div>
    </div>
  );
}
