"use client";

/**
 * CapabilitiesFlow — interactive strategy board for the Capabilities section.
 *
 * GSAP Flip gallery pattern (GridFlowEffect-inspired, NOT scroll-driven):
 *   1. Flip.getState(cards) before the active card changes
 *   2. React re-renders (active card takes the featured 2×2 slot, grid
 *      re-flows dense around it)
 *   3. Flip.from(state) animates old layout → new layout
 * Detail text crossfades separately. Prev/next cycle; cards are buttons.
 *
 * Reduced motion: no Flip, instant active switch.
 * Mobile (<640): stacked cards, no spatial reflow.
 * Tablet (640-1023): stable 2-column grid, tap updates the detail panel:
 * no spans, no dense flow, no Flip.
 * Desktop (1024+): full board with featured 2×2 slot + Flip.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { isHeavyTransitionActive } from "@/lib/motion/motionState";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion/reducedMotion";
import { cn } from "@/lib/utils/cn";
import home from "@/content/home.json";

interface FlowCapability {
  id: string;
  label: string;
  title: string;
  value: string;
  meta: string;
}

const FLOW_CAPS: FlowCapability[] = home.capabilities.items;

const DESKTOP_QUERY = "(min-width: 1024px)";

type GsapCore = typeof import("gsap").gsap;
type FlipPlugin = typeof import("gsap/Flip").Flip;
type FlipState = ReturnType<FlipPlugin["getState"]>;
type FlipTimeline = ReturnType<FlipPlugin["from"]>;
type GsapTween = ReturnType<GsapCore["fromTo"]>;
type GsapMatchMedia = ReturnType<GsapCore["matchMedia"]>;

export default function CapabilitiesFlow() {
  const flowRoot = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<GsapCore | null>(null);
  const flipRef = useRef<FlipPlugin | null>(null);
  const flipStateRef = useRef<FlipState | null>(null);
  const flipTlRef = useRef<FlipTimeline | null>(null);
  const detailTweenRef = useRef<GsapTween | null>(null);
  const isAnimatingRef = useRef(false);
  const mountedRef = useRef(false);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY);

  useEffect(() => {
    if (!desktop || reduced) {
      gsapRef.current = null;
      flipRef.current = null;
      return;
    }

    let cancelled = false;
    let mm: GsapMatchMedia | null = null;

    Promise.all([import("@/lib/motion/gsap"), import("gsap/Flip")]).then(
      ([motion, flipModule]) => {
        if (cancelled) return;
        motion.registerGsap();
        mm = motion.gsap.matchMedia();
        mm.add(DESKTOP_QUERY, () => {
          motion.gsap.registerPlugin(flipModule.Flip);
          gsapRef.current = motion.gsap;
          flipRef.current = flipModule.Flip;

          return () => {
            flipTlRef.current?.kill();
            detailTweenRef.current?.kill();
            flipStateRef.current = null;
            isAnimatingRef.current = false;
            gsapRef.current = null;
            flipRef.current = null;
          };
        });
      }
    );

    return () => {
      cancelled = true;
      mm?.revert();
      flipTlRef.current?.kill();
      detailTweenRef.current?.kill();
      flipStateRef.current = null;
      isAnimatingRef.current = false;
      gsapRef.current = null;
      flipRef.current = null;
    };
  }, [desktop, reduced]);

  const activate = (index: number) => {
    if (index === active || (desktop && isAnimatingRef.current)) return;
    const root = flowRoot.current;
    // Skip Flip under reduced motion, during heavy transitions, and below lg:
    // <640 is a stacked layout and 640-1023 is a static grid. Neither
    // has spatial reflow, and Flip's `absolute: true` would yank cards out of
    // flow mid-animation.
    if (!reduced && desktop && !isHeavyTransitionActive() && root && flipRef.current) {
      flipStateRef.current = flipRef.current.getState(
        root.querySelectorAll("[data-flip-card]"),
        { simple: true }
      );
    }
    setActive(index);
  };

  const step = (dir: 1 | -1) =>
    activate((active + dir + FLOW_CAPS.length) % FLOW_CAPS.length);

  // After React re-lays-out the grid, animate from the captured state.
  useLayoutEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const state = flipStateRef.current;
    flipStateRef.current = null;

    if (state && !reduced && desktop && flipRef.current) {
      const clearFlipStyles = () => {
        isAnimatingRef.current = false;
        if (!flowRoot.current || !gsapRef.current) return;
        gsapRef.current.set(flowRoot.current.querySelectorAll("[data-flip-card]"), {
          clearProps: "position,top,left,right,bottom,width,height,transform,zIndex",
        });
      };

      isAnimatingRef.current = true;
      flipTlRef.current?.kill();
      flipTlRef.current = flipRef.current.from(state, {
        duration: 1.05,
        ease: "power4.inOut",
        absolute: true,
        nested: true,
        scale: true,
        onComplete: clearFlipStyles,
        onInterrupt: clearFlipStyles,
      });
    }

    if (detailRef.current && !reduced && desktop && gsapRef.current) {
      detailTweenRef.current?.kill();
      detailTweenRef.current = gsapRef.current.fromTo(
        detailRef.current.children,
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.03,
          overwrite: "auto",
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const cap = FLOW_CAPS[active];
  const prevCap = FLOW_CAPS[(active - 1 + FLOW_CAPS.length) % FLOW_CAPS.length];
  const nextCap = FLOW_CAPS[(active + 1) % FLOW_CAPS.length];

  return (
    <div ref={flowRoot} className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-12">
      {/* Strategy board */}
      <div
        data-slot="main-grid"
        className="grid min-w-0 w-full max-w-full grid-cols-1 gap-3 overflow-visible sm:grid-cols-2 sm:gap-4 lg:col-span-8 lg:grid-cols-3 lg:auto-rows-[minmax(8.5rem,auto)] lg:grid-flow-dense lg:gap-3"
      >
        {FLOW_CAPS.map((c, i) => {
          const isActive = i === active;
          return (
            <button
              key={c.id}
              type="button"
              data-flip-card
              data-flip-id={c.id}
              onClick={() => activate(i)}
              aria-pressed={isActive}
              className={cn(
                "group min-h-[9.5rem] w-full rounded-2xl border p-5 text-left lg:min-h-0 lg:p-6",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-600",
                isActive
                  ? // Light active panel: navy/bronze text only (never champagne on light).
                    // Featured 2×2 slot only on the lg+ board (Flip range).
                    "border-mist-300/60 bg-mist-300 lg:col-span-2 lg:row-span-2"
                  : "border-steel-400/25 bg-ink transition-colors duration-500 hover:bg-surface-2"
              )}
            >
              <div className="flex items-start justify-between transition-transform duration-300 group-hover:-translate-y-0.5">
                <span
                  className={cn(
                    "font-display text-[0.6rem] tracking-[0.2em]",
                    isActive ? "text-bronze-600" : "text-champagne/50"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isActive
                      ? "bg-bronze-600"
                      : "bg-bronze/40 transition-colors duration-500 group-hover:bg-champagne"
                  )}
                />
              </div>
              <p
                className={cn(
                  "mt-6 text-[0.62rem] uppercase tracking-[0.25em]",
                  isActive ? "text-bronze-600" : "text-haze/50"
                )}
              >
                {c.label}
              </p>
              <h3
                className={cn(
                  "mt-2 font-display font-semibold leading-tight",
                  isActive
                    ? "text-[clamp(1.35rem,5vw,1.875rem)] text-navy-600"
                    : "text-[clamp(1rem,3.4vw,1.125rem)] text-mist-300"
                )}
              >
                {c.title}
              </h3>
              {isActive && (
                <p className="mt-4 hidden max-w-sm text-sm leading-relaxed text-navy-500 sm:block">
                  {c.value}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Active detail + flow nav */}
      <aside
        data-slot="active-detail"
        className="flex min-w-0 w-full max-w-full flex-col justify-between rounded-2xl border border-steel-400/25 bg-ink p-5 sm:p-7 lg:col-span-4"
      >
        <div ref={detailRef} aria-live="polite">
          <p className="font-display text-[0.6rem] tracking-[0.25em] text-champagne/60">
            {String(active + 1).padStart(2, "0")} / {String(FLOW_CAPS.length).padStart(2, "0")}
          </p>
          <p className="eyebrow mt-6">{cap.label}</p>
          <h3 className="mt-3 font-display text-[clamp(1.35rem,4vw,1.75rem)] font-semibold leading-tight text-mist-300">
            {cap.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-haze/70">{cap.value}</p>
          <p className="mt-6 break-words text-[0.62rem] uppercase tracking-[0.22em] text-bronze-600">
            {cap.meta}
          </p>
        </div>

        <nav
          data-slot="flow-nav"
          aria-label="Capabilities navigation"
          className="mt-10 border-t border-steel-400/25 pt-6"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 text-[0.62rem] uppercase tracking-[0.2em] text-haze/50">
            <span className="truncate">{prevCap.title}</span>
            <span className="truncate text-right">{nextCap.title}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={`Previous capability: ${prevCap.title}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-steel-400/25 text-mist-300 transition-colors duration-300 hover:border-champagne-600 hover:text-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={`Next capability: ${nextCap.title}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-steel-400/25 text-mist-300 transition-colors duration-300 hover:border-champagne-600 hover:text-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-600"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
}
