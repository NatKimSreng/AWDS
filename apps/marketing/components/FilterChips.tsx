"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { fetchServiceTypes, fetchTransportModes } from "@/lib/api";
import type { ServiceType, TransportMode } from "@/lib/types";

const STATIC_FILTERS = [
  { label: "Guided tours", query: "guided" },
  { label: "Dinner shows", query: "dinner" },
  { label: "Entry tickets", query: "ticket" },
];

function FilterChipsInner() {
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get("q")?.toLowerCase() ?? "";
  const activeServiceType = searchParams.get("service_type") ?? "";
  const activeTransportMode = searchParams.get("transport_mode") ?? "";

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);

  useEffect(() => {
    fetchServiceTypes().then((data) => setServiceTypes(Array.isArray(data) ? data : []));
    fetchTransportModes().then((data) => setTransportModes(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
      <button
        type="button"
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-gyg-border bg-white text-sm font-medium text-gyg-text hover:border-gyg-muted transition"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filters
      </button>

      {serviceTypes.map((st) => {
        const isActive = activeServiceType === st.slug;
        return (
          <Link
            key={st.slug}
            href={`/tours?service_type=${encodeURIComponent(st.slug)}`}
            className={`shrink-0 px-3 py-2 rounded-full border text-sm font-medium transition ${
              isActive
                ? "border-gyg-navy bg-gyg-navy text-white"
                : "border-gyg-border bg-white text-gyg-text hover:border-gyg-muted"
            }`}
          >
            {st.name}
          </Link>
        );
      })}

      {transportModes.slice(0, 6).map((tm) => {
        const isActive = activeTransportMode === tm.slug;
        return (
          <Link
            key={tm.slug}
            href={`/tours?transport_mode=${encodeURIComponent(tm.slug)}`}
            className={`shrink-0 px-3 py-2 rounded-full border text-sm font-medium transition ${
              isActive
                ? "border-gyg-navy bg-gyg-navy text-white"
                : "border-gyg-border bg-white text-gyg-text hover:border-gyg-muted"
            }`}
          >
            {tm.name}
          </Link>
        );
      })}

      {STATIC_FILTERS.map((filter) => {
        const isActive = activeQuery.includes(filter.query);
        return (
          <Link
            key={filter.label}
            href={`/tours?q=${encodeURIComponent(filter.query)}`}
            className={`shrink-0 px-3 py-2 rounded-full border text-sm font-medium transition ${
              isActive
                ? "border-gyg-navy bg-gyg-navy text-white"
                : "border-gyg-border bg-white text-gyg-text hover:border-gyg-muted"
            }`}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function FilterChips() {
  return (
    <Suspense fallback={<div className="h-10 bg-gray-100 rounded-full animate-pulse w-full" />}>
      <FilterChipsInner />
    </Suspense>
  );
}
