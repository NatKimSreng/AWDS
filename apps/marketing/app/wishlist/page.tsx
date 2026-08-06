"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchFavorites, toggleFavorite, type FavoriteItem } from "@/lib/authApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import SectionHeading from "@/components/SectionHeading";
import { Heart, Loader2 } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated()) {
      router.push(`/login?returnTo=${encodeURIComponent("/wishlist")}`);
      return;
    }

    setIsLoading(true);
    fetchFavorites()
      .then((items) => {
        setFavorites(items);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load wishlist"))
      .finally(() => setIsLoading(false));
  }, [authLoading, isAuthenticated, router]);

  return (
    <div className="flex flex-col min-h-screen bg-sand-bg">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <SectionHeading
          title="Your wishlist"
          subtitle="Tours and experiences you saved for later"
        />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gyg-navy" />
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {!isLoading && !error && favorites.length === 0 && (
          <div className="mt-10 bg-white rounded-2xl border border-gyg-border p-12 text-center">
            <Heart className="w-12 h-12 text-gyg-muted mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gyg-navy mb-2">Your wishlist is empty</h2>
            <p className="text-gyg-muted mb-6">Save tours you love and come back to book them anytime.</p>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center bg-gyg-navy hover:bg-black text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Explore tours
            </Link>
          </div>
        )}

        {!isLoading && !error && favorites.length > 0 && (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <TourCard
                key={item.id}
                {...item.activity}
                favorite={true}
                onFavoriteToggle={async (id, isFavorite) => {
                  try {
                    await toggleFavorite(id);
                    if (!isFavorite) {
                      setFavorites((prev) =>
                        prev.filter((f) => f.activity.id !== id)
                      );
                    }
                  } catch {
                    // silently ignore; TourCard already reverts local state
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
