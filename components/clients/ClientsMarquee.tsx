"use client";

import type { MediaItem } from "@/lib/manifest/types";

/**
 * Cinematic client rail — two opposing monochrome marquee rows with edge fades
 * and a hover reveal (adapted from new_inkspir's logo treatment).
 */
function Row({
  logos,
  reverse,
  duration,
}: {
  logos: MediaItem[];
  reverse?: boolean;
  duration: number;
}) {
  // Duplicate for a seamless -50% loop.
  const track = [...logos, ...logos];
  return (
    <div className="group/row relative overflow-hidden">
      <div
        className="flex w-max items-center gap-6 md:gap-10"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {track.map((logo, i) => (
          <div
            key={`${logo.src}-${i}`}
            className="group/cell relative flex h-24 w-40 flex-none items-center justify-center rounded-2xl border border-mist-300/[0.06] bg-mist-300/[0.02] p-6 transition-colors duration-500 hover:border-champagne/30 md:h-28 md:w-52"
          >
            {/* shimmer sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-mist/10 to-transparent transition-transform duration-[1200ms] ease-in-out group-hover/cell:translate-x-full" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt="Client logo"
              loading="lazy"
              className="max-h-full max-w-full object-contain opacity-55 brightness-0 invert transition-all duration-500 group-hover/cell:scale-110 group-hover/cell:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientsMarquee({ logos }: { logos: MediaItem[] }) {
  if (!logos.length) return null;
  const mid = Math.ceil(logos.length / 2);
  const rowA = logos.slice(0, mid);
  const rowB = logos.slice(mid).concat(logos.slice(0, Math.max(0, mid - (logos.length - mid))));

  return (
    <div
      className="relative flex flex-col gap-6"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <Row logos={rowA} duration={44} />
      <Row logos={rowB.length ? rowB : rowA} reverse duration={52} />
    </div>
  );
}
