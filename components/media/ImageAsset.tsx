"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { MediaItem } from "@/lib/manifest/types";

interface Props {
  item: MediaItem;
  className?: string;
  sizes?: string;
  priority?: boolean;
  alt?: string;
  fill?: boolean;
}

/** next/image wrapper with intrinsic sizing + graceful error fallback. */
export default function ImageAsset({
  item,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  alt,
  fill = true,
}: Props) {
  const [errored, setErrored] = useState(false);
  const label = alt ?? item.title;

  if (errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-2 text-haze/50",
          className
        )}
        aria-label={label}
      >
        <span className="font-display text-[0.6rem] uppercase tracking-[0.3em]">
          {label}
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={item.src}
        alt={label}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setErrored(true)}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={item.src}
      alt={label}
      width={item.width ?? 1200}
      height={item.height ?? 1500}
      sizes={sizes}
      priority={priority}
      onError={() => setErrored(true)}
      className={cn(className)}
    />
  );
}
