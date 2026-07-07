"use client";

/**
 * CinematicOpening — unified scroll chapter replacing the old Hero + About pair.
 *
 * One 240svh driver with a sticky 100svh scene: an OGL cylinder carousel of
 * portfolio visuals rotates under ScrollTrigger scrub while two text phases
 * (identity → strategic about) hand over across the scroll.
 *
 * The old Hero→About SectionBoundary is intentionally bypassed: the phase
 * handoff inside this chapter IS the transition between the first two
 * content beats. All other boundaries are untouched.
 *
 * Reduced motion: no WebGL, no scrub — a static premium composition.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion/gsap";
import { onHeavyTransitionChange, isHeavyTransitionActive } from "@/lib/motion/motionState";
import type { CylinderScene } from "@/lib/motion/cinematicOpening";
import TransitionLink from "@/components/transitions/TransitionLink";
import { profile } from "@/lib/data/profile";
import type { MediaItem } from "@/lib/manifest/types";

const MAX_PANELS = 12;

const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "5", label: "Sectors Covered" },
  { value: "2", label: "Markets · JO / KSA" },
];

const PHASE_1_BODY =
  "Strategy, content, campaigns, and brand systems built for measurable attention.";
const PHASE_2_BODY =
  "From healthcare and retail to F&B, sport, real estate, and clinics — selected work shaped as strategic case files.";

function selectImages(previews: MediaItem[]): MediaItem[] {
  return previews.filter((p) => p.kind === "image").slice(0, MAX_PANELS);
}

function Phase1Content() {
  return (
    <>
      <p className="co-fade eyebrow mb-5">{profile.location}</p>
      <h1 className="co-fade display-hero">
        Sultan <span className="text-champagne">Shadi</span>
      </h1>
      <p className="co-fade mt-4 font-display text-sm uppercase tracking-[0.25em] text-mist-700">
        {profile.primaryTitle}
      </p>
      <p className="co-fade lede mt-6 max-w-2xl">{PHASE_1_BODY}</p>
    </>
  );
}

function Phase2Content() {
  return (
    <>
      <p className="co-fade eyebrow mb-5">01 — About</p>
      <h2 className="co-fade display-2">
        Strategy first.
        <br />
        <span className="text-champagne">Brands that convert.</span>
      </h2>
      <p className="co-fade lede mx-auto mt-6 max-w-2xl">{PHASE_2_BODY}</p>
      <div className="co-fade mx-auto mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-steel-400/25 pt-6">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-2xl font-bold text-mist-300 md:text-4xl">{s.value}</p>
            <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-haze/60">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="co-fade pointer-events-auto mt-10 flex flex-wrap justify-center gap-4">
        <TransitionLink href="#work" intent="section" label="WORK" className="btn-primary">
          View Work
        </TransitionLink>
        <TransitionLink href="#contact" intent="section" label="SULTAN" className="btn-ghost">
          Contact
        </TransitionLink>
      </div>
    </>
  );
}

/** Static premium composition for prefers-reduced-motion: no WebGL, no scrub. */
function StaticOpening({ images }: { images: MediaItem[] }) {
  const strip = images.slice(0, 3);
  return (
    <section id="hero" className="relative bg-navy-600">
      <div className="shell flex min-h-svh flex-col justify-center py-24">
        <Phase1Content />
        {strip.length > 0 && (
          <div className="mt-14 grid max-w-3xl grid-cols-3 gap-4">
            {strip.map((item) => (
              <div
                key={item.src}
                className="relative aspect-[3/4] overflow-hidden rounded-xl border border-steel-400/25"
              >
                <Image src={item.src} alt="" fill sizes="240px" className="object-cover opacity-80" />
                <div className="absolute inset-0 bg-navy-900/30" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shell pb-28 text-center">
        <Phase2Content />
      </div>
    </section>
  );
}

export default function CinematicOpening({ previews }: { previews: MediaItem[] }) {
  const root = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const images = selectImages(previews);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reduced !== false) return;
    const rootEl = root.current;
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!rootEl || !viewport || !canvas) return;

    registerGsap();

    // OGL loads lazily so it stays out of the initial homepage chunk and is
    // never downloaded under reduced motion.
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import("@/lib/motion/cinematicOpening").then(({ createCylinderScene }) => {
      if (cancelled) return;

      const scene: CylinderScene = createCylinderScene(
        canvas,
        images.map((i) => i.src)
      );

      // RAF runs only while the chapter is on screen and no heavy transition is live.
      let visible = false;
      let heavy = isHeavyTransitionActive();
      const syncRun = () => {
        if (visible && !heavy) scene.start();
        else scene.stop();
      };
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          syncRun();
        },
        { threshold: 0 }
      );
      io.observe(rootEl);
      const offHeavy = onHeavyTransitionChange((active) => {
        heavy = active;
        syncRun();
      });

      const ro = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        scene.resize(width, height);
      });
      ro.observe(viewport);

      const ctx = gsap.context(() => {
        const setBar = gsap.quickSetter(barRef.current, "scaleX");
        const setPct = gsap.quickSetter(pctRef.current, "textContent");

        gsap.set(".co-phase-2", { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: rootEl,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
              scene.setProgress(self.progress);
              setBar(self.progress);
              setPct(String(Math.round(self.progress * 100)).padStart(3, "0") + "%");
            },
          },
        });

        // Timeline time == scroll progress (total duration 1).
        tl.to(".co-hint", { autoAlpha: 0, duration: 0.05 }, 0.02)
          // Phase 1 hands off…
          .to(
            ".co-phase-1 .co-fade",
            { yPercent: -30, autoAlpha: 0, stagger: 0.012, duration: 0.13, ease: "power2.in" },
            0.3
          )
          .set(".co-phase-1", { autoAlpha: 0 }, 0.46)
          // …phase 2 arrives during the closer-orbit beat.
          .set(".co-phase-2", { autoAlpha: 1 }, 0.52)
          .fromTo(
            ".co-phase-2 .co-fade",
            { yPercent: 24, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, stagger: 0.016, duration: 0.16, ease: "power3.out" },
            0.54
          )
          // Pad so the timeline spans the full scrub range.
          .to({}, { duration: 0.3 }, 0.7);
      }, rootEl);

      const rect = viewport.getBoundingClientRect();
      scene.resize(rect.width, rect.height);
      // No global ScrollTrigger.refresh() here: SmoothScrollProvider already
      // refreshes ~300ms after mount; a second full-page measure is waste.

      cleanup = () => {
        ctx.revert();
        io.disconnect();
        ro.disconnect();
        offHeavy();
        scene.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // `images` derives from server props and is stable for the page lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  if (reduced === true) return <StaticOpening images={images} />;

  return (
    <section id="hero" ref={root} className="relative h-[240svh] bg-navy-600">
      <div ref={viewportRef} className="sticky top-0 h-svh overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Scrim + vignette keep panels cinematic and text readable. */}
        <div className="pointer-events-none absolute inset-0 bg-navy-900/30" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy-900/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-navy-900/80 to-transparent" />

        {/* Text layer */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="shell relative h-full">
            <div className="co-phase-1 absolute inset-x-[var(--shell-x)] top-1/2 -translate-y-1/2">
              <Phase1Content />
            </div>
            <div className="co-phase-2 absolute inset-x-[var(--shell-x)] top-1/2 -translate-y-1/2 text-center">
              <Phase2Content />
            </div>
          </div>
        </div>

        {/* Restrained progress rail */}
        <div className="pointer-events-none absolute bottom-[9svh] left-1/2 z-20 w-[240px] -translate-x-1/2">
          <div className="relative h-px w-full bg-mist/10">
            <div
              ref={barRef}
              className="absolute inset-0 origin-left bg-champagne-600"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <div className="mt-2 flex justify-between font-display text-[0.6rem] tracking-[0.2em] text-haze/50">
            <span>{profile.name}</span>
            <span ref={pctRef}>000%</span>
          </div>
        </div>

        <div className="co-hint pointer-events-none absolute bottom-8 left-[var(--shell-x)] z-20 flex items-center gap-2 text-haze/50">
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden />
          <span className="font-display text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
        </div>
      </div>
    </section>
  );
}
