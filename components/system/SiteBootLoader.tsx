"use client";

/**
 * SiteBootLoader — real initial loading gate.
 *
 * Server-renders an opaque cover (so the first paint is never half-loaded UI),
 * then waits for practical readiness signals instead of a fake timer:
 *   1. document.fonts.ready        — 7 Unbounded weights + Tinos are heavy
 *   2. window "load"               — hero images / critical assets
 *   3. double requestAnimationFrame after hydration — first stable frame
 *
 * Each signal advances a thin champagne progress rail. Timing guards:
 *   MIN_VISIBLE 600ms  — no single-frame flash
 *   MAX_WAIT   3000ms  — the loader can never trap the user
 *
 * Reduced motion: no rail/fade animation, quick dismissal.
 * Accessibility: role="status", "Loading site" label, aria-busy while shown.
 * Removal is a fixed-overlay fade → unmount: zero layout shift.
 *
 * Sits at z-[140], above the route overlay (z-120), so TransitionProvider's
 * untouched initial reveal simply plays out underneath it.
 */
import { useEffect, useRef, useState } from "react";
import SultanShadiMark from "@/components/brand/SultanShadiMark";
import styles from "./SiteBootLoader.module.css";

const MIN_VISIBLE = 600;
const MAX_WAIT = 3000;
const FADE_MS = 500;

type Stage = "loading" | "leaving" | "done";

export default function SiteBootLoader() {
  const [stage, setStage] = useState<Stage>("loading");
  const [reducedMotion, setReducedMotion] = useState(false);
  const progressRef = useRef<SVGCircleElement>(null);
  const reducedRef = useRef(false);

  // Mount-once readiness race.
  useEffect(() => {
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    setReducedMotion(reduced);
    const startedAt = performance.now();

    // Block scroll while the gate is up (same pattern as the overlay Menu).
    document.documentElement.style.overflow = "hidden";

    const setProgress = (p: number) => {
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(100 - p * 100);
      }
    };
    if (reduced && progressRef.current) {
      progressRef.current.style.transition = "none";
    }

    let gatesDone = 0;
    const bump = () => {
      gatesDone += 1;
      // 3 real gates → 0.3 / 0.62 / 0.94; the final 6% lands on dismissal.
      setProgress(Math.min(0.94, 0.3 + (gatesDone - 1) * 0.32));
    };
    setProgress(0.08); // rail is alive immediately

    const gates: Promise<unknown>[] = [
      // 1. Fonts
      (document.fonts?.ready ?? Promise.resolve()).then(bump),
      // 2. Window load (critical images/assets). Already complete on bfcache.
      new Promise<void>((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", () => resolve(), { once: true });
      }).then(bump),
      // 3. First stable frame after hydration.
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }).then(bump),
    ];

    const ready = Promise.race([
      Promise.all(gates),
      new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT)),
    ]);

    void ready.then(() => {
      if (cancelled) return;
      const elapsed = performance.now() - startedAt;
      const minWait = reduced ? 0 : Math.max(0, MIN_VISIBLE - elapsed);
      window.setTimeout(() => {
        if (cancelled) return;
        setProgress(1);
        setStage("leaving");
      }, minWait);
    });

    return () => {
      cancelled = true;
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Fade-out → unmount, and always release the scroll lock.
  useEffect(() => {
    if (stage === "loading") return;
    document.documentElement.style.overflow = "";
    if (stage !== "leaving") return;
    const t = window.setTimeout(
      () => setStage("done"),
      reducedRef.current ? 50 : FADE_MS
    );
    return () => window.clearTimeout(t);
  }, [stage]);

  if (stage === "done") return null;

  const transition = reducedMotion
    ? "none"
    : `opacity ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;

  return (
    <div
      role="status"
      aria-busy={stage === "loading"}
      aria-label="Loading site"
      className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden bg-navy-600 px-6"
      style={{
        opacity: stage === "leaving" ? 0 : 1,
        transition,
        pointerEvents: stage === "leaving" ? "none" : "auto",
      }}
    >
      <div className={styles.content}>
        <div className={styles.stage} aria-hidden="true">
          <svg className={styles.rings} viewBox="0 0 100 100">
            <circle className={styles.staticRing} cx="50" cy="50" r="47" />
            <circle
              className={styles.outerArc}
              cx="50"
              cy="50"
              r="47"
              pathLength="100"
            />
            <circle className={styles.progressTrack} cx="50" cy="50" r="40" />
            <circle
              ref={progressRef}
              className={styles.progressCircle}
              cx="50"
              cy="50"
              r="40"
              pathLength="100"
            />
            <circle
              className={styles.innerArc}
              cx="50"
              cy="50"
              r="35.5"
              pathLength="100"
            />
            <path className={styles.alignmentMark} d="M50 0L51.6 2.6L50 5.2L48.4 2.6Z" />
            <path className={styles.alignmentMark} d="M50 94.8L51.6 97.4L50 100L48.4 97.4Z" />
          </svg>
          <SultanShadiMark
            variant="full"
            size="68%"
            decorative
            className={styles.mark}
          />
        </div>
        <p className={styles.label} aria-hidden="true">
          Preparing portfolio
        </p>
      </div>
    </div>
  );
}
