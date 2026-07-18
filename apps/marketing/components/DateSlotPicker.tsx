"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CalendarDays, X, Calendar } from "lucide-react";
import { fetchAvailability } from "@/lib/api";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time?: string;
  remaining: number;
  price_override?: string | null;
}

interface DateGroup {
  date: string;
  slots: TimeSlot[];
}

interface DateSlotPickerProps {
  slug: string;
  basePriceUsd: string | number;
  onSelect?: (date: string, slot: TimeSlot) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatLong(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default function DateSlotPicker({
  slug,
  basePriceUsd,
  onSelect,
}: DateSlotPickerProps) {
  const [groups, setGroups] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [rangeEnd, setRangeEnd] = useState<Date>(() => {
    const t = new Date();
    t.setDate(t.getDate() + 30);
    return t;
  });

  useEffect(() => {
    if (hasFetched) return;
    let cancelled = false;

    const today = new Date();
    const from = today.toISOString().slice(0, 10);
    const to = new Date(today.setDate(today.getDate() + 30)).toISOString().slice(0, 10);

    fetchAvailability(slug, from, to)
      .then((data) => {
        if (cancelled) return;
        const fetched = (data?.dates ?? []) as DateGroup[];
        setGroups(fetched);
        setHasFetched(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, hasFetched]);

  const availableMap = useMemo(() => {
    const map = new Map<string, DateGroup>();
    for (const g of groups) {
      if (g.slots?.some((s) => s.remaining > 0)) map.set(g.date, g);
    }
    return map;
  }, [groups]);

  const todayStr = toDateStr(new Date());
  const minView = startOfMonth(new Date());
  const maxView = startOfMonth(rangeEnd);
  const canPrev = viewMonth > minView;
  const canNext = viewMonth < maxView;

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (string | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(toDateStr(new Date(year, month, d)));
    }
    return out;
  }, [viewMonth]);

  const selectedGroup = useMemo(
    () => (selectedDate ? availableMap.get(selectedDate) : undefined),
    [selectedDate, availableMap]
  );

  const handleDateClick = (dateStr: string) => {
    if (!availableMap.has(dateStr)) return;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setOpen(false);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    if (onSelect) onSelect(selectedDate ?? "", slot);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-12 bg-gyg-bg rounded-xl animate-pulse" />
        <div className="h-12 bg-gyg-bg rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || groups.length === 0) {
    return (
      <div className="rounded-xl border border-gyg-border bg-gyg-bg p-4 text-sm text-gyg-muted">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="w-4 h-4" />
          <span className="font-medium text-gyg-text">Select a date to see availability</span>
        </div>
        <p>Availability is loading or no slots are open for this tour yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date trigger field */}
      <div>
        <label className="block text-sm font-semibold text-gyg-text mb-1.5">Date</label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2 rounded-xl border border-gyg-border bg-white px-4 py-3 text-left hover:border-angkor-orange transition"
        >
          <Calendar className="w-4 h-4 text-angkor-orange" />
          <span className={selectedDate ? "text-sm font-medium text-gyg-text" : "text-sm text-gyg-muted"}>
            {selectedDate ? formatLong(selectedDate) : "Select a date"}
          </span>
        </button>
      </div>

      {/* Popup calendar */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gyg-navy">Choose a date</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gyg-bg text-gyg-muted"
                aria-label="Close calendar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                disabled={!canPrev}
                className="p-1 rounded-full border border-gyg-border disabled:opacity-30 hover:bg-gyg-bg"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gyg-text">
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                disabled={!canNext}
                className="p-1 rounded-full border border-gyg-border disabled:opacity-30 hover:bg-gyg-bg"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gyg-muted mb-1">
              {WEEKDAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((dateStr, i) => {
                if (!dateStr) return <span key={`b-${i}`} className="aspect-square" />;
                const isPast = dateStr < todayStr;
                const group = availableMap.get(dateStr);
                const isAvailable = !!group && !isPast;
                const isActive = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleDateClick(dateStr)}
                    disabled={!isAvailable}
                    className={`aspect-square rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-angkor-orange text-white font-bold"
                        : isAvailable
                          ? "bg-angkor-orange-light/60 text-angkor-orange hover:bg-angkor-orange-light"
                          : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {Number(dateStr.slice(8))}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-gyg-border flex items-center gap-3 text-[11px] text-gyg-muted">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-angkor-orange-light/60 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-angkor-orange inline-block" /> Selected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Time slots for the selected date */}
      {(selectedGroup?.slots?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gyg-text flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Available start times
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedGroup?.slots.map((slot) => {
              const active = selectedSlot?.id === slot.id;
              const price = slot.price_override
                ? Number(slot.price_override).toFixed(2)
                : Number(basePriceUsd).toFixed(2);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  disabled={slot.remaining <= 0}
                  className={`rounded-xl border px-2 py-2 text-sm transition ${
                    active
                      ? "border-angkor-orange bg-angkor-orange-light text-angkor-orange"
                      : slot.remaining <= 0
                        ? "border-gyg-border bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "border-gyg-border bg-white hover:border-angkor-orange"
                  }`}
                >
                  <span className="font-semibold">{slot.start_time}</span>
                  <span className="block text-xs text-gyg-muted">${price}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedSlot && (
        <p className="text-xs text-gyg-muted">
          Selected:{" "}
          <span className="font-medium text-gyg-text">
            {selectedDate} at {selectedSlot.start_time}
          </span>
        </p>
      )}
    </div>
  );
}