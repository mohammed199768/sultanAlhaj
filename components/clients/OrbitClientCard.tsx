"use client";

import { forwardRef } from "react";
import type { MediaItem } from "@/lib/manifest/types";
import styles from "./OrbitClients.module.css";

interface Props {
  logo: MediaItem;
  index: number;
  active: boolean;
  label: string;
  ring: number;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: () => void;
  onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

/**
 * A single orbiting client card. Purely presentational — the parent sets its
 * position/scale/opacity imperatively (via the forwarded ref) inside one rAF
 * loop, so React never re-renders per frame.
 */
const OrbitClientCard = forwardRef<HTMLButtonElement, Props>(function OrbitClientCard(
  { logo, index, active, label, ring, onEnter, onLeave, onSelect, onPointerMove },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      data-orbit-card=""
      data-active={active ? "true" : "false"}
      data-ring={ring}
      onPointerEnter={onEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onSelect}
      aria-label={`${label} client logo`}
      aria-pressed={active}
      className={styles.card}
    >
      <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt=""
        loading="lazy"
        draggable={false}
        className={styles.logo}
      />
      <span className={styles.cardHalo} />
    </button>
  );
});

export default OrbitClientCard;
