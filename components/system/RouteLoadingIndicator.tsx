"use client";

/**
 * RouteLoadingIndicator — thin top progress hairline driven by the EXISTING
 * transition state (usePageTransition().isTransitioning). It adds visible
 * click feedback without introducing a second transition system:
 *
 *  - internal route links / nav links / CTAs / hash links wrapped in
 *    TransitionLink flip isTransitioning → the bar appears immediately
 *  - route completion (or the provider's own reveal) clears it
 *  - a 4s safety timeout force-clears it so it can never get stuck
 *  - it never blocks scroll or pointer events (pointer-events: none)
 *  - reduced motion: static hairline, no sweep animation
 *
 * z-[125]: above the route overlay (z-120) so it stays visible during covers.
 */
import { useEffect, useRef, useState } from "react";
import { usePageTransition } from "@/components/transitions/TransitionProvider";

const SAFETY_TIMEOUT = 4000;
const EXIT_MS = 350;

export default function RouteLoadingIndicator() {
  const { isTransitioning } = usePageTransition();
  const [visible, setVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const safetyRef = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (isTransitioning) {
      setVisible(true);
      setFinishing(false);
      safetyRef.current = window.setTimeout(() => {
        setFinishing(true);
        window.setTimeout(() => setVisible(false), EXIT_MS);
      }, SAFETY_TIMEOUT);
      return () => {
        if (safetyRef.current) window.clearTimeout(safetyRef.current);
      };
    }
    if (!visible) return;
    // Transition ended: complete the bar, then fade it.
    setFinishing(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      setFinishing(false);
    }, EXIT_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransitioning]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[125] h-[2px] overflow-hidden"
      style={{
        opacity: finishing ? 0 : 1,
        transition: `opacity ${EXIT_MS}ms ease-out`,
      }}
    >
      <div
        className={
          reduced.current || finishing
            ? "h-full bg-champagne-600"
            : "route-rail h-full bg-champagne-600"
        }
        style={{ width: reduced.current || finishing ? "100%" : undefined }}
      />
    </div>
  );
}
