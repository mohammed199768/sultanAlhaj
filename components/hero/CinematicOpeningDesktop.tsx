"use client";

/**
 * CinematicOpening — a single sticky scroll chapter that plays as FOUR internal
 * text beats over one OGL cylinder scene, then releases into Capabilities.
 *
 * This is NOT four page sections. There is one driver (280svh mobile / 380svh
 * desktop) with a sticky 100svh scene. Inside it:
 *   Beat 1 Identity  → Beat 2 Team Leader → Beat 3 Strategic edge → Beat 4 System
 * An intro image-row layer (lg+) reads as a film contact sheet, then compresses
 * and fades as the OGL orbit rises — the illusion that the portfolio material is
 * becoming a moving system. The existing local Hero→Capabilities handoff
 * (co-exit + co-canvas dim + co-mask aperture + co-rail) is preserved, retimed
 * to 0.82–1.0. No new page sections, no global transitions, no new deps.
 *
 * Reduced motion: no WebGL, no scrub — the four beats render as a static
 * stacked composition.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion/gsap";
import { onHeavyTransitionChange, isHeavyTransitionActive } from "@/lib/motion/motionState";
import type { CylinderScene } from "@/lib/motion/cinematicOpening";
import { profile } from "@/lib/data/profile";
import type { MediaItem } from "@/lib/manifest/types";

const MAX_PANELS = 12;

interface Beat {
  eyebrow: string;
  headline: ReactNode;
  subline: string;
  hero?: boolean;
}

// Four internal beats. Copy is fixed premium English — one strong headline and
// one controlled supporting line each. No invented metrics, awards, or clients.
const BEATS: Beat[] = [
  {
    eyebrow: "Sultan Shadi",
    headline: (
      <>
        Sultan <span className="text-champagne">Shadi</span>
      </>
    ),
    subline: "A marketing mind built for attention, structure, and growth.",
    hero: true,
  },
  {
    eyebrow: "Current Role",
    headline: "Team Leader",
    subline: "Leading creative, content, and campaign direction with a strategy-first mindset.",
  },
  {
    eyebrow: "Strategic Edge",
    headline: "He turns scattered attention into structured demand.",
    subline:
      "From brand positioning to content systems and campaign execution, every move is designed to make the message clearer, sharper, and harder to ignore.",
  },
  {
    eyebrow: "The System Behind the Work",
    headline: "Capabilities are not a list. They are the operating system.",
    subline:
      "Strategy, content, media, and execution connect into one flow — built to move brands from visibility to measurable momentum.",
  },
];

function selectImages(previews: MediaItem[]): MediaItem[] {
  return previews.filter((p) => p.kind === "image").slice(0, MAX_PANELS);
}

/** Cycle images into a fixed-length row so rows stay full even with few assets. */
function buildRow(images: MediaItem[], count: number, offset: number): MediaItem[] {
  if (!images.length) return [];
  return Array.from({ length: count }, (_, i) => images[(offset + i) % images.length]);
}

function BeatContent({ beat }: { beat: Beat }) {
  const Heading = beat.hero ? "h1" : "h2";
  return (
    <>
      <p className="co-fade eyebrow mb-5">{beat.eyebrow}</p>
      <Heading
        className={`co-fade mx-auto max-w-4xl ${beat.hero ? "display-hero" : "display-2"}`}
      >
        {beat.headline}
      </Heading>
      <p className="co-fade lede mx-auto mt-5 max-w-2xl md:mt-6">{beat.subline}</p>
    </>
  );
}

/** Static premium composition for prefers-reduced-motion: no WebGL, no scrub. */
function StaticOpening({ images }: { images: MediaItem[] }) {
  const strip = images.slice(0, 3);
  return (
    <section id="hero" className="relative bg-navy-600">
      <div className="shell flex min-h-svh flex-col justify-center gap-16 py-24 text-center md:gap-20">
        <BeatContent beat={BEATS[0]} />
        {strip.length > 0 && (
          <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-4">
            {strip.map((item) => (
              <div
                key={item.src}
                className="relative aspect-[3/4] overflow-hidden rounded-xl border border-steel-400/25"
              >
                <Image src={item.src} alt="" fill sizes="240px" className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-navy-900/30" />
              </div>
            ))}
          </div>
        )}
        {/* Nav "About" anchor lands mid-chapter in the static layout too. */}
        <div id="about" className="scroll-mt-24">
          <BeatContent beat={BEATS[1]} />
        </div>
        <BeatContent beat={BEATS[2]} />
        <BeatContent beat={BEATS[3]} />
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
  const rows = [buildRow(images, 6, 0), buildRow(images, 6, 4), buildRow(images, 6, 8)];

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reduced !== false) return;
    registerGsap();
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [reduced]);

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
      let hidden = document.hidden;
      const syncRun = () => {
        if (visible && !heavy && !hidden) scene.start();
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
      const onVisibilityChange = () => {
        hidden = document.hidden;
        syncRun();
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      const ro = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        scene.resize(width, height);
      });
      ro.observe(viewport);

      const ctx = gsap.context(() => {
        const setBar = gsap.quickSetter(barRef.current, "scaleX");
        const setPct = gsap.quickSetter(pctRef.current, "textContent");

        // Initial states: beats 2–4 hidden; orbit starts invisible so the
        // image rows own the opening frame; rows sit offset + faintly tilted.
        gsap.set(["[data-beat='1']", "[data-beat='2']", "[data-beat='3']"], { autoAlpha: 0 });
        gsap.set(".co-canvas", { opacity: 0 });
        gsap.set(".co-row", {
          xPercent: -16,
          rotation: (i: number) => (i === 1 ? 0.4 : -0.5),
        });

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
        const enter = (sel: string, at: number) =>
          tl.fromTo(
            `${sel} .co-fade`,
            { yPercent: 28, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, stagger: 0.014, duration: 0.1, ease: "power3.out" },
            at
          );
        const exit = (sel: string, at: number) =>
          tl.to(
            `${sel} .co-fade`,
            { yPercent: -24, autoAlpha: 0, stagger: 0.01, duration: 0.1, ease: "power2.in" },
            at
          );

        tl.to(".co-hint", { autoAlpha: 0, duration: 0.05 }, 0.02);

        // 0.00–0.30 — image rows → orbit illusion. Rows parallax-drift, then
        // compress (scale up) + lift + fade while the OGL canvas fades in, so
        // the contact-sheet visually "becomes" the moving ring.
        tl.to(
          ".co-row",
          { xPercent: (i: number) => -16 + (i === 1 ? 8 : -8), duration: 0.28, ease: "none" },
          0
        )
          .to(
            ".co-rows",
            { scale: 1.12, yPercent: -4, autoAlpha: 0, duration: 0.15, ease: "power1.in" },
            0.14
          )
          .to(".co-canvas", { opacity: 1, duration: 0.15, ease: "power1.out" }, 0.15);

        // Beat 1 (Identity) exits.
        exit("[data-beat='0']", 0.16);
        // Beat 2 (Team Leader).
        tl.set("[data-beat='1']", { autoAlpha: 1 }, 0.21);
        enter("[data-beat='1']", 0.22);
        exit("[data-beat='1']", 0.4);
        // Beat 3 (Strategic edge).
        tl.set("[data-beat='2']", { autoAlpha: 1 }, 0.45);
        enter("[data-beat='2']", 0.46);
        exit("[data-beat='2']", 0.6);
        // Beat 4 (System) — enters, holds through the settle, recedes at the end
        // so the Capabilities heading's own Reveal takes over cleanly.
        tl.set("[data-beat='3']", { autoAlpha: 1 }, 0.65);
        enter("[data-beat='3']", 0.66);
        tl.to(
          "[data-beat='3'] .co-fade",
          { yPercent: -14, autoAlpha: 0, stagger: 0.008, duration: 0.09, ease: "power2.in" },
          0.9
        );

        // 0.82–1.0 — preserved local handoff. The cylinder settles and dims,
        // the scene collapses into a navy depth layer (.co-exit), then a soft
        // aperture (.co-mask, lg+) opens from the lower center over the exit
        // layer's navy-600 floor — the same color the page.tsx bridge starts
        // from — so the seam into Capabilities is continuous.
        tl.to(".co-exit", { autoAlpha: 1, duration: 0.14, ease: "power1.in" }, 0.82)
          .to(".co-canvas", { opacity: 0.4, duration: 0.14, ease: "power1.in" }, 0.82)
          .to(".co-rail", { autoAlpha: 0, duration: 0.06 }, 0.84)
          .fromTo(
            ".co-mask",
            { autoAlpha: 0, scale: 0.92 },
            { autoAlpha: 1, scale: 1, duration: 0.16, ease: "power2.out" },
            0.84
          );
      }, rootEl);

      const rect = viewport.getBoundingClientRect();
      scene.resize(rect.width, rect.height);
      // The one-frame refresh above handles the dynamic hero height. Scene
      // setup does not change document flow, so no extra refresh is needed here.

      cleanup = () => {
        ctx.revert();
        io.disconnect();
        ro.disconnect();
        offHeavy();
        document.removeEventListener("visibilitychange", onVisibilityChange);
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
    <section id="hero" ref={root} className="relative h-[280svh] bg-navy-600 lg:h-[380svh]">
      {/* Anchor for the nav's "About" link — lands mid-chapter where the role /
          strategic beats resolve. Positioned in scroll space, not the sticky
          viewport, so Lenis can target it. */}
      <div
        id="about"
        aria-hidden
        className="pointer-events-none absolute left-0 top-[38%] h-px w-px"
      />
      <div ref={viewportRef} className="sticky top-0 h-svh overflow-hidden">
        <canvas ref={canvasRef} className="co-canvas absolute inset-0 h-full w-full" />

        {/* Intro image-row layer (lg+ only). Reads as a cinematic contact sheet
            behind the identity beat, then compresses + fades into the orbit.
            Transform/opacity only, pointer-events none, no per-frame filter.
            Below lg it is absent: text priority, simpler + stabler handoff. */}
        {images.length > 0 && (
          <div
            aria-hidden
            className="co-rows pointer-events-none absolute inset-0 z-[3] hidden origin-center flex-col justify-center gap-6 overflow-hidden lg:flex"
          >
            {rows.map((row, r) => (
              <div key={r} className="co-row flex w-[150%] shrink-0 gap-6">
                {row.map((item, i) => (
                  <div
                    key={`${r}-${i}-${item.src}`}
                    className="relative aspect-[3/4] w-[15%] shrink-0 overflow-hidden rounded-lg border border-steel-400/15"
                  >
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      sizes="220px"
                      className="object-cover opacity-40"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Scrim + vignette keep panels cinematic and text readable.
            Below lg the scrim is heavier: text priority over the 3D layer
            and a simpler, stabler handoff. */}
        <div className="pointer-events-none absolute inset-0 z-[4] bg-navy-900/60 lg:bg-navy-900/40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-40 bg-gradient-to-b from-navy-900/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-48 bg-gradient-to-t from-navy-900/80 to-transparent" />

        {/* Exit layer — resolves the scene into flat navy as the chapter ends
            so the next section reads as a continuation, not a cut. Driven by
            the same scrub timeline inside the 0.82–1.0 handoff. */}
        <div className="co-exit pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-navy-600/40 via-navy-600/75 to-navy-600 opacity-0" />

        {/* Aperture mask (lg+ only) — a soft opening from the lower center that
            the chapter resolves into (0.84–1.0). Below lg the handoff is the
            plain fade + gradient (exit layer + page bridge) only. */}
        <div
          aria-hidden
          className="co-mask pointer-events-none absolute inset-x-0 bottom-0 z-[6] hidden h-[42svh] origin-bottom opacity-0 lg:block"
          style={{
            background:
              "radial-gradient(70% 90% at 50% 100%, rgba(7, 23, 57, 0) 0%, rgba(7, 23, 57, 0) 38%, rgba(0, 4, 25, 0.85) 72%, #071739 100%)",
          }}
        />

        {/* Text layer — four beats overlaid, one readable at a time. */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="shell relative h-full">
            {BEATS.map((beat, i) => (
              <div
                key={i}
                data-beat={i}
                className="absolute inset-x-[var(--shell-x)] top-1/2 -translate-y-1/2 text-center"
              >
                <BeatContent beat={beat} />
              </div>
            ))}
          </div>
        </div>

        {/* Restrained progress rail */}
        <div className="co-rail pointer-events-none absolute bottom-[9svh] left-1/2 z-20 w-[min(240px,70vw)] -translate-x-1/2">
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
