"use client";

/**
 * ClientsShowcase — layout switch for the Clients section.
 *
 * - Below lg (1024px), or whenever prefers-reduced-motion: a static logo
 *   grid (ClientsStaticGrid). No RAF, no orbit chunk downloaded.
 * - lg+ with motion allowed: the optimized orbit constellation, loaded
 *   lazily so it stays out of the shared bundle.
 *
 * SSR/first paint renders the grid (media queries resolve after hydration),
 * which is also the better LCP: real content immediately, orbit upgrades in.
 */
import dynamic from "next/dynamic";
import type { MediaItem } from "@/lib/manifest/types";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion/reducedMotion";
import ClientsStaticGrid from "./ClientsStaticGrid";

const DESKTOP_QUERY = "(min-width: 1024px)";

const OrbitClients = dynamic(() => import("./OrbitClients"), {
  // Size-matched placeholder while the orbit chunk streams in — no layout shift.
  loading: () => (
    <div
      aria-hidden
      className="min-h-[clamp(31rem,62vw,45rem)] w-full rounded-3xl border border-steel-400/15 bg-mist-300/[0.02]"
    />
  ),
});

export default function ClientsShowcase({ logos }: { logos: MediaItem[] }) {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = usePrefersReducedMotion();

  if (!logos.length) return null;

  if (desktop && !reducedMotion) {
    return <OrbitClients logos={logos} />;
  }
  return <ClientsStaticGrid logos={logos} />;
}
