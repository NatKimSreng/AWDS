"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "duration", label: "Shortest duration" },
];

const DURATION_OPTIONS = [
  { value: "", label: "Any duration" },
  { value: "180", label: "Up to 3 hours" },
  { value: "360", label: "Up to 6 hours" },
  { value: "480", label: "Up to 8 hours" },
];

const PRICE_OPTIONS = [
  { value: "", label: "Any price" },
  { value: "0-50", label: "Under $50" },
  { value: "50-100", label: "$50 – $100" },
  { value: "100-200", label: "$100 – $200" },
  { value: "200-", label: "$200+" },
];

interface FilterContentProps {
  searchParams: URLSearchParams;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  activeFilters: { label: string; param: string }[];
  onClear: () => void;
}

function FilterContent({ searchParams, pathname, router, activeFilters, onClear }: FilterContentProps) {
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.delete("page");
    return params.toString();
  };

  const updateParam = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`);
  };

  const updatePrice = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!val) {
      params.delete("min_price");
      params.delete("max_price");
    } else if (val.endsWith("-")) {
      params.set("min_price", val.replace("-", ""));
      params.delete("max_price");
    } else {
      const [min, max] = val.split("-");
      params.set("min_price", min);
      params.set("max_price", max);
    }
    params.delete("price");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gyg-text mb-2">Sort by</label>
        <div className="relative">
          <select
            value={searchParams.get("sort") ?? ""}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-full appearance-none rounded-xl border border-gyg-border bg-white px-3 py-2.5 text-sm outline-none focus:border-angkor-orange"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gyg-text mb-2">Duration</label>
        <div className="relative">
          <select
            value={searchParams.get("duration") ?? ""}
            onChange={(e) => updateParam("duration", e.target.value)}
            className="w-full appearance-none rounded-xl border border-gyg-border bg-white px-3 py-2.5 text-sm outline-none focus:border-angkor-orange"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gyg-text mb-2">Price</label>
        <div className="relative">
          <select
            value={searchParams.get("price") ?? ""}
            onChange={(e) => updatePrice(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gyg-border bg-white px-3 py-2.5 text-sm outline-none focus:border-angkor-orange"
          >
            {PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="instant_book"
          type="checkbox"
          checked={searchParams.get("instant_book") === "1"}
          onChange={(e) => updateParam("instant_book", e.target.checked ? "1" : "")}
          className="w-4 h-4 text-angkor-orange border-gyg-border rounded focus:ring-angkor-orange"
        />
        <label htmlFor="instant_book" className="text-sm text-gyg-text">
          Instant book only
        </label>
      </div>

      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="w-full text-center text-sm text-angkor-orange font-semibold hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export default function TourFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const clearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFilters: { label: string; param: string }[] = [];
  const sortValue = searchParams.get("sort");
  const durationValue = searchParams.get("duration");
  const priceValue = searchParams.get("price");
  if (sortValue) {
    activeFilters.push({
      label: SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? "Sort",
      param: "sort",
    });
  }
  if (durationValue) {
    activeFilters.push({
      label: DURATION_OPTIONS.find((o) => o.value === durationValue)?.label ?? "Duration",
      param: "duration",
    });
  }
  if (priceValue) {
    activeFilters.push({
      label: PRICE_OPTIONS.find((o) => o.value === priceValue)?.label ?? "Price",
      param: "price",
    });
  }
  if (searchParams.get("instant_book") === "1") {
    activeFilters.push({ label: "Instant book", param: "instant_book" });
  }

  const updateParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Desktop top bar */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <button
              key={filter.param}
              onClick={() => updateParam(filter.param, "")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-angkor-orange-light text-angkor-orange text-sm font-medium hover:bg-angkor-orange/20"
            >
              {filter.label}
              <X className="w-3.5 h-3.5" />
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gyg-muted hover:text-gyg-text underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gyg-muted hidden xl:inline">Sort by</span>
          <div className="relative">
            <select
              value={sortValue ?? ""}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none rounded-xl border border-gyg-border bg-white pl-3 pr-9 py-2 text-sm outline-none focus:border-angkor-orange"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile filter toggle + sheet */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-gyg-border bg-white px-4 py-2.5 text-sm font-semibold text-gyg-text"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters &amp; sort
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-full max-w-sm bg-white h-full overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gyg-navy">Filters &amp; sort</h3>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-6 h-6 text-gyg-text" />
                </button>
              </div>
              <FilterContent
                searchParams={searchParams}
                pathname={pathname}
                router={router}
                activeFilters={activeFilters}
                onClear={clearFilters}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
