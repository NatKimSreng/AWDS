"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon, LayoutGrid } from "lucide-react";
import TourCard from "./TourCard";
import type { Activity } from "@/lib/types";

const TourMap = dynamic(() => import("./TourMap"), { ssr: false });

interface TourResultsClientProps {
  activities: Activity[];
  heading: string;
  subtitle: string;
}

export default function TourResultsClient({
  activities,
  heading,
  subtitle,
}: TourResultsClientProps) {
  const [showMap, setShowMap] = useState(false);

  if (showMap) {
    return (
      <TourMap
        activities={activities}
        onClose={() => setShowMap(false)}
      />
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gyg-navy">{heading}</h2>
          {subtitle && <p className="text-sm text-gyg-muted">{subtitle}</p>}
        </div>
        {activities.length > 0 && activities.some((a) => a.meeting_point_lat && a.meeting_point_lng) && (
          <button
            onClick={() => setShowMap(true)}
            className="inline-flex items-center gap-2 bg-white border border-gyg-border hover:bg-gyg-bg text-gyg-navy text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <MapIcon className="w-4 h-4" /> Show on map
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gyg-border p-12 text-center">
          <LayoutGrid className="w-12 h-12 text-gyg-muted mx-auto mb-4" />
          <p className="text-gyg-muted">No tours match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5">
          {activities.map((activity) => (
            <TourCard key={activity.id} {...activity} />
          ))}
        </div>
      )}
    </div>
  );
}
