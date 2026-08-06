"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isBefore, startOfToday } from "date-fns";
import {
  Search,
  Users,
  ChevronDown,
  Minus,
  Plus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";


interface SearchBarProps {
  initialQuery?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [showParticipants, setShowParticipants] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const calendarRef = useRef<HTMLDivElement>(null);
  const participantsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        setDate(parsed);
        setViewMonth(startOfMonth(parsed));
      }
    }
    const p = searchParams.get("participants");
    if (p) setParticipants(Number(p) || 1);
  }, [searchParams]);



  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
      if (
        participantsRef.current &&
        !participantsRef.current.contains(event.target as Node)
      ) {
        setShowParticipants(false);
      }
    }
    if (showCalendar || showParticipants) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar, showParticipants]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (date) params.set("date", format(date, "yyyy-MM-dd"));
    if (participants > 1) params.set("participants", String(participants));
    router.push(`/tours?${params.toString()}`);
  };

  const adjustParticipants = (delta: number) => {
    setParticipants((prev) => Math.max(1, Math.min(20, prev + delta)));
  };

  const today = startOfToday();
  const todayStr = toDateStr(today);
  const dateLabel = useMemo(() => {
    if (!date) return "Add dates";
    return isBefore(date, today) ? "Add dates" : format(date, "MMM d");
  }, [date, today]);

  const minView = startOfMonth(today);
  const maxView = useMemo(() => {
    const t = new Date();
    t.setMonth(t.getMonth() + 6);
    return startOfMonth(t);
  }, []);
  const canPrev = viewMonth > minView;
  const canNext = viewMonth < maxView;

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(new Date(year, month, d));
    }
    return out;
  }, [viewMonth]);

  const handleDateClick = (d: Date) => {
    const dateStr = toDateStr(d);
    if (dateStr < todayStr) return;
    setDate(d);
    setShowCalendar(false);
  };

  const calendarDropdown = showCalendar && (
    <div ref={calendarRef} className="absolute top-full left-0 mt-2 z-[60]">
      <div className="bg-white rounded-2xl shadow-xl border border-gyg-border overflow-hidden w-[320px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gyg-border">
          <span className="text-sm font-bold text-gyg-navy">Select date</span>
          <div className="flex items-center gap-1">
            {date && (
              <button
                type="button"
                onClick={() => setDate(undefined)}
                className="text-xs font-semibold text-gyg-muted hover:text-gyg-text px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="p-1.5 rounded-full hover:bg-gyg-bg text-gyg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              disabled={!canPrev}
              className="p-1.5 rounded-full border border-gyg-border disabled:opacity-30 hover:bg-gyg-bg text-gyg-text"
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
              className="p-1.5 rounded-full border border-gyg-border disabled:opacity-30 hover:bg-gyg-bg text-gyg-text"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gyg-muted mb-1">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={`b-${i}`} className="aspect-square" />;
              const dateStr = toDateStr(d);
              const isPast = dateStr < todayStr;
              const isActive = date ? toDateStr(date) === dateStr : false;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDateClick(d)}
                  disabled={isPast}
                  className={`aspect-square rounded-full text-sm font-medium transition flex items-center justify-center ${
                    isActive
                      ? "bg-gyg-navy text-white font-bold"
                      : isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : "bg-gyg-bg text-gyg-text hover:bg-gyg-border"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const participantsDropdown = showParticipants && (
    <div ref={participantsRef} className="absolute top-full right-0 mt-2 z-[60]">
      <div className="bg-white rounded-2xl shadow-xl border border-gyg-border overflow-hidden w-72">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gyg-border">
          <span className="text-sm font-bold text-gyg-navy">Participants</span>
          <button
            type="button"
            onClick={() => setShowParticipants(false)}
            className="p-1.5 rounded-full hover:bg-gyg-bg text-gyg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-medium text-gyg-text">Adults</div>
              <div className="text-xs text-gyg-muted">Ages 13+</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustParticipants(-1)}
                className="w-9 h-9 rounded-full border border-gyg-border flex items-center justify-center text-gyg-text hover:border-gyg-navy transition disabled:opacity-40"
                disabled={participants <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {participants}
              </span>
              <button
                type="button"
                onClick={() => adjustParticipants(1)}
                className="w-9 h-9 rounded-full border border-gyg-border flex items-center justify-center text-gyg-text hover:border-gyg-navy transition disabled:opacity-40"
                disabled={participants >= 20}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowParticipants(false)}
            className="w-full bg-gyg-navy text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-black transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-full shadow-xl border border-gyg-border/80 p-1.5 flex flex-col sm:flex-row items-stretch gap-1 relative"
      >
        <div className="flex-1 flex items-center gap-2 px-4 py-2 sm:border-r border-gyg-border min-w-0"
          onClick={() => setShowCalendar(false)}
        >
          <Search className="w-4 h-4 text-gyg-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where do you want to go?"
            className="w-full text-sm text-gyg-text placeholder:text-gyg-muted outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center relative sm:border-r border-gyg-border">
          <button
            type="button"
            onClick={() => {
              setShowCalendar((s) => !s);
              setShowParticipants(false);
            }}
            className={`w-full min-w-[140px] flex items-center justify-between px-4 py-2 text-sm text-gyg-text rounded-full transition ${showCalendar ? "bg-gyg-navy/5 text-gyg-navy" : "hover:bg-gyg-bg"}`}
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gyg-navy" />
              {dateLabel}
            </span>
            <ChevronDown className={`w-3 h-3 text-gyg-muted transition ${showCalendar ? "rotate-180" : ""}`} />
          </button>
          {calendarDropdown}
        </div>

        <div className="flex items-center relative">
          <button
            type="button"
            onClick={() => {
              setShowParticipants((s) => !s);
              setShowCalendar(false);
            }}
            className={`w-full min-w-[160px] flex items-center justify-between px-4 py-2 text-sm text-gyg-text rounded-full transition ${showParticipants ? "bg-gyg-navy/5 text-gyg-navy" : "hover:bg-gyg-bg"}`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gyg-navy" />
              {participants} {participants === 1 ? "person" : "people"}
            </span>
            <ChevronDown className={`w-3 h-3 text-gyg-muted transition ${showParticipants ? "rotate-180" : ""}`} />
          </button>
          {participantsDropdown}
        </div>

        <button
          type="submit"
          className="bg-gyg-navy hover:bg-black text-white rounded-full p-3 flex items-center justify-center transition shrink-0"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>
    </>
  );
}
