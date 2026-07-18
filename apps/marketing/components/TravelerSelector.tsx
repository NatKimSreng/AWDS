"use client";

import { Minus, Plus } from "lucide-react";

interface TravelerSelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function TravelerSelector({
  value,
  min = 1,
  max = 50,
  onChange,
}: TravelerSelectorProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-10 h-10 rounded-full border border-gyg-border flex items-center justify-center text-gyg-text hover:border-angkor-orange hover:text-angkor-orange disabled:opacity-40 disabled:hover:border-gyg-border disabled:hover:text-gyg-text transition"
        aria-label="Decrease travelers"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-12 text-center">
        <span className="text-xl font-bold text-gyg-navy">{value}</span>
      </div>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-10 h-10 rounded-full border border-gyg-border flex items-center justify-center text-gyg-text hover:border-angkor-orange hover:text-angkor-orange disabled:opacity-40 disabled:hover:border-gyg-border disabled:hover:text-gyg-text transition"
        aria-label="Increase travelers"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
