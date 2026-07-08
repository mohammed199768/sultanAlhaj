"use client";

/**
 * ClientsStaticGrid — calm, readable trust wall for mobile/tablet and for
 * prefers-reduced-motion on any width.
 *
 * 2 columns <640px → 3 columns (sm) → 4 columns (md/tablet). No RAF, no
 * intervals — motion is limited to CSS tap/hover/focus states. Broken logo
 * images degrade to a clean text badge instead of an empty tile.
 */
import { useState } from "react";
import type { MediaItem } from "@/lib/manifest/types";

function labelFor(logo: MediaItem, index: number) {
  const readable = logo.title && logo.title !== "Client" ? logo.title : "";
  return readable || `Partner ${String(index + 1).padStart(2, "0")}`;
}

function GridTile({ logo, index }: { logo: MediaItem; index: number }) {
  const [broken, setBroken] = useState(false);
  const label = labelFor(logo, index);

  return (
    <div className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-steel-400/20 bg-mist-300/[0.03] p-4 transition-colors duration-300 active:border-champagne/60 sm:p-5 md:rounded-2xl [@media(hover:hover)]:hover:border-champagne/40 [@media(hover:hover)]:hover:bg-mist-300/[0.05]">
      <span
        aria-hidden
        className="absolute left-2.5 top-2 font-display text-[0.55rem] text-champagne/50"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      {broken ? (
        <span className="px-2 text-center font-display text-[0.6rem] uppercase tracking-[0.2em] text-mist-700">
          {label}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.src}
          alt={label}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setBroken(true)}
          className="max-h-full max-w-full object-contain opacity-70 brightness-0 invert transition-opacity duration-300 group-active:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
        />
      )}
    </div>
  );
}

export default function ClientsStaticGrid({ logos }: { logos: MediaItem[] }) {
  if (!logos.length) return null;
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4"
      aria-label="Sultan Shadi client logos"
    >
      {logos.map((logo, i) => (
        <GridTile key={`${logo.src}-${i}`} logo={logo} index={i} />
      ))}
    </div>
  );
}
