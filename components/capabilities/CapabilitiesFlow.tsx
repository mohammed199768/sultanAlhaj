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
 * Mobile (<768): horizontal snap cards, no spatial reflow.
 * Tablet (768–1023): stable 2-column grid, tap updates the detail panel —
 * no spans, no dense flow, no Flip.
 * Desktop (1024+): full board with featured 2×2 slot + Flip.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion/gsap";
import { Flip } from "gsap/Flip";
import { isHeavyTransitionActive } from "@/lib/motion/motionState";
import { cn } from "@/lib/utils/cn";

interface FlowCapability {
  id: string;
  label: string;
  title: string;
  value: string;
  meta: string;
}

/** Verified positioning only — value lines reuse existing capability copy. */
const FLOW_CAPS: FlowCapability[] = [
  {
    id: "brand-strategy",
    label: "Strategy",
    title: "Brand Strategy",
    value: "Positioning, funnels and channel plans built to hit commercial goals.",
    meta: "JO · KSA",
  },
  {
    id: "content-architecture",
    label: "Content",
    title: "Content Architecture",
    value: "Culturally-tuned Arabic/English content systems across every format.",
    meta: "Arabic / English",
  },
  {
    id: "paid-campaigns",
    label: "Performance",
    title: "Paid Campaigns",
    value: "Meta, Google, Snapchat and TikTok performance buying.",
    meta: "Meta · Google · Snapchat · TikTok",
  },
  {
    id: "social-growth",
    label: "Growth",
    title: "Social Media Growth",
    value: "Always-on channel management and community growth.",
    meta: "Always-on",
  },
  {
    id: "healthcare",
    label: "Sector",
    title: "Healthcare Marketing",
    value: "Integrated campaigns for medical brands and clinics.",
    meta: "Medical · Clinics",
  },
  {
    id: "fnb-retail",
    label: "Sector",
    title: "F&B / Retail Campaigns",
    value: "Launches and always-on content for F&B and retail brands.",
    meta: "F&B · Retail",
  },
  {
    id: "activations",
    label: "Activation",
    title: "Event & Sponsorship Activations",
    value: "On-ground experiences that turn footfall into fans.",
    meta: "Events · Sponsorships",
  },
  {
    id: "reporting",
    label: "Insight",
    title: "Performance Reporting",
    value: "Reporting and insight loops that compound results.",
    meta: "Data-driven",
  },
];

let flipRegistered = false;

export default function CapabilitiesFlow() {
  const flowRoot = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const flipTlRef = useRef<gsap.core.Timeline | null>(null);
  const detailTweenRef = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const mountedRef = useRef(false);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    registerGsap();
    if (!flipRegistered && typeof window !== "undefined") {
      gsap.registerPlugin(Flip);
      flipRegistered = true;
    }
    setReduced(prefersReducedMotion());
    return () => {
      flipTlRef.current?.kill();
      detailTweenRef.current?.kill();
    };
  }, []);

  const activate = (index: number) => {
    if (index === active || isAnimatingRef.current) return;
    const root = flowRoot.current;
    // Skip Flip under reduced motion, during heavy transitions, and below lg:
    // <768 the board is a flex snap-scroller and 768–1023 a static 2-column
    // grid — neither has spatial reflow, and Flip's `absolute: true` would
    // yank cards out of flow mid-animation.
    const spatial =
      typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (!reduced && spatial && !isHeavyTransitionActive() && root && flipRegistered) {
      flipStateRef.current = Flip.getState(
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

    if (state && !reduced) {
      isAnimatingRef.current = true;
      flipTlRef.current?.kill();
      flipTlRef.current = Flip.from(state, {
        duration: 1.05,
        ease: "power4.inOut",
        absolute: true,
        nested: true,
        scale: true,
        onComplete: () => {
          isAnimatingRef.current = false;
        },
        onInterrupt: () => {
          isAnimatingRef.current = false;
        },
      });
    }

    if (detailRef.current && !reduced) {
      detailTweenRef.current?.kill();
      detailTweenRef.current = gsap.fromTo(
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
    <div ref={flowRoot} className="grid gap-6 lg:grid-cols-12">
      {/* Strategy board */}
      <div
        data-slot="main-grid"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0 lg:col-span-8 lg:grid-cols-3 lg:auto-rows-[minmax(8.5rem,auto)] lg:grid-flow-dense lg:gap-3"
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
                "group w-64 shrink-0 snap-start rounded-2xl border p-6 text-left md:w-auto",
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
                  "mt-2 font-display font-semibold",
                  isActive
                    ? "text-2xl text-navy-600 md:text-3xl"
                    : "text-base text-mist-300 md:text-lg"
                )}
              >
                {c.title}
              </h3>
              {isActive && (
                <p className="mt-4 hidden max-w-sm text-sm leading-relaxed text-navy-500 md:block">
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
        className="flex flex-col justify-between rounded-2xl border border-steel-400/25 bg-ink p-7 lg:col-span-4"
      >
        <div ref={detailRef}>
          <p className="font-display text-[0.6rem] tracking-[0.25em] text-champagne/60">
            {String(active + 1).padStart(2, "0")} / {String(FLOW_CAPS.length).padStart(2, "0")}
          </p>
          <p className="eyebrow mt-6">{cap.label}</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-mist-300">
            {cap.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-haze/70">{cap.value}</p>
          <p className="mt-6 text-[0.62rem] uppercase tracking-[0.22em] text-bronze-600">
            {cap.meta}
          </p>
        </div>

        <nav
          data-slot="flow-nav"
          aria-label="Capabilities navigation"
          className="mt-10 border-t border-steel-400/25 pt-6"
        >
          <div className="flex items-center justify-between gap-4 text-[0.62rem] uppercase tracking-[0.2em] text-haze/50">
            <span className="truncate">{prevCap.title}</span>
            <span className="shrink-0 truncate text-right">{nextCap.title}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={`Previous capability: ${prevCap.title}`}
              className="rounded-full border border-steel-400/25 p-3 text-mist-300 transition-colors duration-300 hover:border-champagne-600 hover:text-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={`Next capability: ${nextCap.title}`}
              className="rounded-full border border-steel-400/25 p-3 text-mist-300 transition-colors duration-300 hover:border-champagne-600 hover:text-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-600"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
}
