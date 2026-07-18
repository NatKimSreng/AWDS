"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchHeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function SearchHero({
  title = "Discover & book things to do in Cambodia",
  subtitle = "Skip the lines, book with verified local guides, and explore Angkor your way.",
  backgroundImage = "/images/hero-angkor.jpg",
}: SearchHeroProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/tours?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[480px] md:min-h-[620px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          {subtitle}
        </p>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl p-2 shadow-2xl max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gyg-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you want to experience?"
                className="w-full pl-10 pr-4 py-4 rounded-xl text-gyg-text placeholder:text-gyg-muted focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-angkor-orange hover:bg-angkor-orange-dark text-white font-semibold px-8 py-4 rounded-xl transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
