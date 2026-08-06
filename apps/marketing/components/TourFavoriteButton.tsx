"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { fetchFavoriteStatus, toggleFavorite } from "@/lib/authApi";
import Link from "next/link";

interface TourFavoriteButtonProps {
  activityId: number;
}

export default function TourFavoriteButton({ activityId }: TourFavoriteButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) return;
    setIsLoading(true);
    fetchFavoriteStatus(activityId)
      .then(setIsFavorite)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activityId, isAuthenticated]);

  const handleToggle = async () => {
    if (!isAuthenticated() || isLoading) return;
    setIsLoading(true);
    try {
      const next = await toggleFavorite(activityId);
      setIsFavorite(next);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <button type="button" className="flex items-center gap-1.5 text-gyg-text hover:text-gyg-navy transition">
        <Heart className="w-4 h-4" /> Save
      </button>
    );
  }

  if (!isAuthenticated()) {
    return (
      <Link
        href={`/login?returnTo=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/tours")}`}
        className="flex items-center gap-1.5 text-gyg-text hover:text-gyg-navy transition"
      >
        <Heart className="w-4 h-4" /> Save
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-1.5 transition ${
        isFavorite ? "text-gyg-navy" : "text-gyg-text hover:text-gyg-navy"
      }`}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Saved" : "Save"}
    </button>
  );
}
