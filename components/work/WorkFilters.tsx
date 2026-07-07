"use client";

import { cn } from "@/lib/utils/cn";

export default function WorkFilters({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
}) {
  const all = ["All", ...categories];
  return (
    <div className="no-scrollbar -mx-1 mb-12 flex gap-2 overflow-x-auto pb-2">
      {all.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "whitespace-nowrap rounded-full border px-4 py-2 font-display text-[0.62rem] uppercase tracking-[0.2em] transition-all duration-300",
            active === c
              ? "border-champagne bg-champagne text-ink"
              : "border-steel-400/35 text-haze/70 hover:border-champagne/60 hover:text-mist-300"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
