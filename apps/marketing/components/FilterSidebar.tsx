"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronLeft } from "lucide-react";

interface FilterSidebarProps {
  filterContent: React.ReactNode;
  children: React.ReactNode;
}

export default function FilterSidebar({ filterContent, children }: FilterSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        {open ? (
          <aside className="w-56 xl:w-64 2xl:w-72 shrink-0">
            <div className="sticky top-24 z-20 bg-white rounded-2xl border border-gyg-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gyg-navy">Filters</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-gyg-muted hover:text-gyg-text hover:bg-gyg-bg transition"
                  aria-label="Hide filters"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              {filterContent}
            </div>
          </aside>
        ) : (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="sticky top-24 z-20 flex items-center gap-2 px-4 py-3 rounded-2xl border border-gyg-border bg-white shadow-card text-sm font-semibold text-gyg-text hover:text-gyg-navy transition"
              aria-label="Show filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter toggle is rendered by TourFilters */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
