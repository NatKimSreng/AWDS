"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ArrowUpDown, Clock, DollarSign, Zap } from "lucide-react";

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

interface TourFiltersProps {
  variant?: "sidebar" | "toolbar";
}

function createQueryString(searchParams: URLSearchParams, name: string, value: string) {
  const params = new URLSearchParams(searchParams.toString());
  if (value) {
    params.set(name, value);
  } else {
    params.delete(name);
  }
  params.delete("page");
  return params.toString();
}

function FilterSelect({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gyg-text mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gyg-border bg-white pl-9 pr-9 py-2.5 text-sm outline-none focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 transition"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted pointer-events-none" />
      </div>
    </div>
  );
}

export function selectedPriceFromParams(params: URLSearchParams): string {
  const min = params.get("min_price") ?? "";
  const max = params.get("max_price") ?? "";
  if (!min && !max) return "";
  if (min && !max) return `${min}-`;
  return `${min}-${max}`;
}

function FilterContent({
  searchParams,
  pathname,
  router,
  activeFilters,
  onClear,
}: {
  searchParams: URLSearchParams;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  activeFilters: { label: string; param: string }[];
  onClear: () => void;
}) {
  const updateParam = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(searchParams, name, value)}`);
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
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectedPrice = selectedPriceFromParams(searchParams);

  return (
    <div className="space-y-5">
      <FilterSelect
        label="Sort by"
        icon={ArrowUpDown}
        value={searchParams.get("sort") ?? ""}
        options={SORT_OPTIONS}
        onChange={(val) => updateParam("sort", val)}
      />

      <FilterSelect
        label="Duration"
        icon={Clock}
        value={searchParams.get("duration") ?? ""}
        options={DURATION_OPTIONS}
        onChange={(val) => updateParam("duration", val)}
      />

      <FilterSelect
        label="Price"
        icon={DollarSign}
        value={selectedPrice}
        options={PRICE_OPTIONS}
        onChange={(val) => updatePrice(val)}
      />

      <div className="flex items-center gap-3 p-3 rounded-xl border border-gyg-border bg-white cursor-pointer">
        <input
          id="instant_book"
          type="checkbox"
          checked={searchParams.get("instant_book") === "1"}
          onChange={(e) => updateParam("instant_book", e.target.checked ? "1" : "")}
          className="w-4 h-4 text-gyg-navy border-gyg-border rounded focus:ring-gyg-navy cursor-pointer"
        />
        <label htmlFor="instant_book" className="flex-1 flex items-center gap-2 text-sm text-gyg-text cursor-pointer">
          <Zap className="w-4 h-4 text-gyg-navy" /> Instant book only
        </label>
      </div>

      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="w-full text-center text-sm text-gyg-navy font-semibold py-2 rounded-xl border border-gyg-border hover:bg-gyg-bg transition"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export default function TourFilters({ variant = "toolbar" }: TourFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mobileOpen]);

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
  const priceValue = selectedPriceFromParams(searchParams);
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
      param: "min_price",
    });
  }
  if (searchParams.get("instant_book") === "1") {
    activeFilters.push({ label: "Instant book", param: "instant_book" });
  }

  const removeFilter = (param: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    if (param === "min_price" || param === "max_price") {
      params.delete("min_price");
      params.delete("max_price");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateParam = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(searchParams, name, value)}`);
  };

  if (variant === "sidebar") {
    return (
      <FilterContent
        searchParams={searchParams}
        pathname={pathname}
        router={router}
        activeFilters={activeFilters}
        onClear={clearFilters}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop toolbar */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <button
              key={filter.param}
              onClick={() => removeFilter(filter.param)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gyg-border text-gyg-text text-sm font-medium hover:border-gyg-navy transition shadow-soft"
            >
              {filter.label}
              <X className="w-3.5 h-3.5" />
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gyg-muted hover:text-gyg-text underline px-2"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gyg-muted">Sort by</span>
          <div className="relative">
            <select
              value={sortValue ?? ""}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none rounded-xl border border-gyg-border bg-white pl-4 pr-10 py-2 text-sm outline-none focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 transition"
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

      {/* Mobile filter toggle + dropdown */}
      <div className="lg:hidden relative" ref={mobileDropdownRef}>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-gyg-border bg-white px-4 py-2.5 text-sm font-semibold text-gyg-text shadow-soft active:bg-gyg-bg transition"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters & sort
          {activeFilters.length > 0 && (
            <span className="ml-1.5 bg-gyg-navy text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-gyg-border shadow-xl p-5 overflow-y-auto max-h-[80vh]">
            <FilterContent
              searchParams={searchParams}
              pathname={pathname}
              router={router}
              activeFilters={activeFilters}
              onClear={() => {
                clearFilters();
                setMobileOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
