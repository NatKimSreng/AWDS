"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Star, X, MapPin } from "lucide-react";
import type { Activity } from "@/lib/types";

/* ────────────────────────────────────────────
   Geo helpers
   ──────────────────────────────────────────── */

interface LocationGroup {
  id: string;
  lat: number;
  lng: number;
  count: number;
  activities: Activity[];
  name: string;
}

function groupByAreaName(activities: Activity[]): LocationGroup[] {
  const map = new Map<string, Activity[]>();

  for (const activity of activities) {
    if (activity.meeting_point_lat == null || activity.meeting_point_lng == null) continue;
    const lat = Number(activity.meeting_point_lat);
    const lng = Number(activity.meeting_point_lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    const areaName = activity.city?.name ?? "Siem Reap";
    if (!map.has(areaName)) map.set(areaName, []);
    map.get(areaName)!.push(activity);
  }

  return Array.from(map.entries()).map(([name, acts]) => {
    const lats = acts.map((a) => Number(a.meeting_point_lat!));
    const lngs = acts.map((a) => Number(a.meeting_point_lng!));
    const avgLat = lats.reduce((s, v) => s + v, 0) / lats.length;
    const avgLng = lngs.reduce((s, v) => s + v, 0) / lngs.length;
    return {
      id: name,
      lat: avgLat,
      lng: avgLng,
      count: acts.length,
      activities: acts,
      name,
    };
  });
}

/* ────────────────────────────────────────────
   Icons
   ──────────────────────────────────────────── */

function createClusterIcon(count: number, isActive: boolean) {
  const size = isActive ? 60 : 48;
  const badge = 24;

  return L.divIcon({
    className: "custom-cluster",
    html: `
      <div style="
        position:relative;
        width:${size}px;
        height:${size}px;
        cursor:pointer;
        transition:all 0.2s ease;
      ">
        <div style="
          position:absolute;
          inset:0;
          border-radius:50%;
          overflow:hidden;
          border:${isActive ? "3px solid #111827" : "2px solid white"};
          box-shadow:${isActive ? "0 8px 24px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.25)"};
          background:white;
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="
          position:absolute;
          top:-4px;
          right:-4px;
          min-width:${badge}px;
          height:${badge}px;
          padding:0 7px;
          border-radius:999px;
          background:#111827;
          color:white;
          font-size:12px;
          font-weight:700;
          display:flex;
          align-items:center;
          justify-content:center;
          border:2px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          z-index:10;
        ">${count}</div>
      </div>
    `,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
    popupAnchor: [0, -(size + 4) / 2 - 4],
  });
}

function createSingleIcon(imageUrl: string | null, isActive: boolean) {
  const size = isActive ? 56 : 44;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        overflow:hidden;
        border:${isActive ? "3px solid #111827" : "2px solid white"};
        box-shadow:${isActive ? "0 8px 20px rgba(0,0,0,0.35)" : "0 4px 12px rgba(0,0,0,0.25)"};
        background:white;
        cursor:pointer;
        transition:all 0.2s ease;
      ">
        <img src="${imageUrl ?? "/placeholder.svg"}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

/* ────────────────────────────────────────────
   Map helpers
   ──────────────────────────────────────────── */

function FitBounds({ groups, selectedGroupId }: { groups: LocationGroup[]; selectedGroupId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedGroupId) {
      const g = groups.find((gr) => gr.id === selectedGroupId);
      if (g) {
        map.flyTo([g.lat, g.lng], 14, { duration: 0.8 });
        return;
      }
    }
    const points = groups.map((g) => [g.lat, g.lng] as [number, number]);
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [map, groups, selectedGroupId]);
  return null;
}

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */

interface TourMapProps {
  activities: Activity[];
  onClose: () => void;
}

export default function TourMap({ activities, onClose }: TourMapProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const groups = useMemo(() => groupByAreaName(activities), [activities]);

  const displayed = useMemo(() => {
    if (!selectedGroupId) return activities;
    return groups.find((g) => g.id === selectedGroupId)?.activities ?? [];
  }, [selectedGroupId, groups, activities]);

  const center = useMemo<[number, number]>(() => {
    if (selectedGroupId) {
      const g = groups.find((gr) => gr.id === selectedGroupId);
      if (g) return [g.lat, g.lng];
    }
    const first = activities.find((a) => a.meeting_point_lat && a.meeting_point_lng);
    return first ? [Number(first.meeting_point_lat!), Number(first.meeting_point_lng!)] : [13.4125, 103.867];
  }, [selectedGroupId, groups, activities]);

  const handleMarkerHover = (id: number) => {
    setHoveredId(id);
    const el = itemRefs.current[id];
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-white">
      {/* Sidebar */}
      <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-gyg-border bg-white h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gyg-border">
          <div>
            <h2 className="text-lg font-bold text-gyg-navy">Map view</h2>
            <p className="text-sm text-gyg-muted">
              {selectedGroupId ? `${displayed.length} in this area` : `${activities.length} experiences`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-white border border-gyg-border hover:bg-gyg-bg text-gyg-navy text-sm font-semibold px-3.5 py-2 rounded-xl transition"
          >
            <X className="w-4 h-4" /> Close map
          </button>
        </div>

        {/* Filter chips */}
        <div className="px-4 pt-3 pb-1">
          {selectedGroupId ? (
            <button
              onClick={() => setSelectedGroupId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gyg-navy text-white text-xs font-semibold hover:bg-gray-800 transition"
            >
              <X className="w-3 h-3" />
              Show all areas
            </button>
          ) : (
            <div className="flex gap-2 overflow-x-auto">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-gyg-navy text-xs font-semibold border border-gyg-border hover:border-gyg-muted transition"
                >
                  <MapPin className="w-3 h-3" />
                  {g.name} ({g.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cards */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayed.map((activity) => {
            const isHovered = hoveredId === activity.id;
            return (
              <div
                key={activity.id}
                ref={(el) => { itemRefs.current[activity.id] = el; }}
                onMouseEnter={() => setHoveredId(activity.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex gap-3 p-3 rounded-xl border transition cursor-pointer ${
                  isHovered
                    ? "border-gyg-navy bg-gyg-bg shadow-sm"
                    : "border-gyg-border hover:border-gyg-muted bg-white"
                }`}
              >
                <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={activity.hero_image ?? "/placeholder.svg"}
                    alt={activity.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs text-gyg-muted truncate">
                    {activity.city?.name ?? "Siem Reap"}
                  </p>
                  <h3 className="text-sm font-bold text-gyg-text line-clamp-2 leading-snug">
                    {activity.title}
                  </h3>
                  <div className="mt-auto flex items-center gap-1 text-xs">
                    <span className="font-medium text-gyg-text">
                      {activity.avg_rating.toFixed(1)}
                    </span>
                    <Star className="w-3 h-3 fill-gyg-text text-gyg-text" />
                    <span className="text-gyg-muted">
                      ({activity.reviews_count.toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative h-full">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <MapResize />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds groups={groups} selectedGroupId={selectedGroupId} />
          {groups.map((group) => {
            const isActive = selectedGroupId === group.id;
            const isHovered = group.activities.some((a) => hoveredId === a.id);
            const isCluster = group.count > 1;

            return (
              <Marker
                key={group.id}
                position={[group.lat, group.lng]}
                icon={
                  isCluster
                    ? createClusterIcon(group.count, isActive || isHovered)
                    : createSingleIcon(group.activities[0].hero_image, isActive || isHovered)
                }
                eventHandlers={{
                  click: () =>
                    setSelectedGroupId((prev) => (prev === group.id ? null : group.id)),
                  mouseover: () => {
                    if (group.count === 1) handleMarkerHover(group.activities[0].id);
                  },
                  mouseout: () => setHoveredId(null),
                }}
              >
                <Popup>
                  {group.count === 1 ? (
                    <SinglePopup activity={group.activities[0]} />
                  ) : (
                    <ClusterPopup group={group} />
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Popup sub-components
   ──────────────────────────────────────────── */

function SinglePopup({ activity }: { activity: Activity }) {
  return (
    <Link href={`/tours/${activity.slug}`} className="block min-w-[220px]">
      <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-gray-100">
        <img
          src={activity.hero_image ?? "/placeholder.svg"}
          alt={activity.title}
          className="object-cover w-full h-full"
        />
      </div>
      <h4 className="font-bold text-gyg-navy text-sm leading-snug mb-1">
        {activity.title}
      </h4>
      <div className="flex items-center gap-1 text-xs mb-2">
        <span className="font-medium text-gyg-text">{activity.avg_rating.toFixed(1)}</span>
        <Star className="w-3 h-3 fill-gyg-text text-gyg-text" />
        <span className="text-gyg-muted">({activity.reviews_count.toLocaleString()})</span>
      </div>
      <p className="text-sm font-extrabold text-gyg-navy">
        From ${Number(activity.base_price_usd).toFixed(2)}
      </p>
    </Link>
  );
}

function ClusterPopup({ group }: { group: LocationGroup }) {
  return (
    <div className="min-w-[200px]">
      <button
        onClick={() => {
          /* handled by parent Marker click */ }
        }
        className="flex items-center gap-2 text-left"
      >
        <div className="w-8 h-8 rounded-full bg-gyg-navy flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-gyg-navy text-sm leading-tight">
            {group.name}
          </h4>
          <p className="text-xs text-gyg-muted">
            {group.count} {group.count === 1 ? "tour" : "tours"}
          </p>
        </div>
      </button>
    </div>
  );
}
