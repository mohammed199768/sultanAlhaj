"use client";

import { useRef, useState } from "react";
import { Play, Film } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { MediaItem } from "@/lib/manifest/types";

interface Props {
  item: MediaItem;
  className?: string;
}

/**
 * Lazy video player. Loads only on user intent (click-to-play), never autoplays
 * with sound. Unsupported (.mov without transcode) shows a premium fallback card.
 */
export default function VideoPlayer({ item, className }: Props) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  if (item.unsupportedVideo) {
    return (
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 bg-surface-2 text-center",
          className
        )}
      >
        {item.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.poster}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        ) : null}
        <div className="relative z-10 flex flex-col items-center gap-2 px-6">
          <Film className="h-6 w-6 text-champagne" aria-hidden />
          <span className="font-display text-[0.62rem] uppercase tracking-[0.28em] text-mist">
            {item.title}
          </span>
          <span className="text-[0.68rem] text-haze/60">Video · preview on request</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-navy-900", className)}>
      {active ? (
        <video
          ref={ref}
          src={item.src}
          poster={item.poster}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play ${item.title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {item.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.poster}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-ink" />
          )}
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-champagne/90 text-ink transition-transform duration-500 group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-0.5" aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}
