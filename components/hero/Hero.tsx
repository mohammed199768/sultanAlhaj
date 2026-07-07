"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion/gsap";
import TransitionLink from "@/components/transitions/TransitionLink";
import { heroScenes } from "@/lib/data/heroScenes";
import { profile } from "@/lib/data/profile";
import type { MediaItem } from "@/lib/manifest/types";

const CARD_SLOTS = [
  "left-[4%] top-[16%] h-44 w-32 md:h-56 md:w-40",
  "right-[6%] top-[12%] h-52 w-36 md:h-72 md:w-52",
  "left-[16%] bottom-[12%] h-48 w-32 md:h-64 md:w-44 hidden sm:block",
  "right-[12%] bottom-[14%] h-44 w-32 md:h-60 md:w-44",
  "left-[38%] top-[8%] h-40 w-28 md:h-52 md:w-36 hidden lg:block",
  "right-[34%] bottom-[8%] h-40 w-28 md:h-52 md:w-36 hidden lg:block",
];
const DEPTHS = [120, 220, 80, 260, 160, 300];

function Words({ text }: { text: string }) {
  const parts = text.split(" ");
  return (
    <span className="block overflow-hidden">
      <span className="hero-line inline-block">
        {parts.map((w, i) => (
          <span key={i} className="hero-word inline-block whitespace-pre">
            {w}
            {i < parts.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Hero({ previews }: { previews: MediaItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const cards = previews.slice(0, CARD_SLOTS.length);

  useGSAP(
    () => {
      registerGsap();
      const reduce = prefersReducedMotion();
      const scenesEls = gsap.utils.toArray<HTMLElement>(".hero-scene");

      if (reduce) {
        scenesEls.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 }));
        gsap.set(".hero-word", { yPercent: 0 });
        return;
      }

      const driver = root.current!.querySelector(".hero-driver") as HTMLElement;
      const setBar = gsap.quickSetter(barRef.current, "scaleX");
      const setPct = gsap.quickSetter(pctRef.current, "textContent");

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: driver,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            setBar(self.progress);
            setPct(String(Math.round(self.progress * 100)).padStart(3, "0") + "%");
          },
        },
      });

      master
        .to(".hero-stage", { rotateX: 8, scale: 1.08, ease: "none" }, 0)
        .to(
          ".hero-card",
          { yPercent: (i) => -(DEPTHS[i % DEPTHS.length] / 6), ease: "none" },
          0
        );

      heroScenes.forEach((scene, index) => {
        const el = scenesEls[index];
        if (!el) return;
        const words = el.querySelectorAll<HTMLElement>(".hero-word");
        const body = el.querySelectorAll<HTMLElement>(".hero-body");
        const targets = [...Array.from(words), ...Array.from(body)];

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: driver,
            start: `${scene.start * 100}% top`,
            end: `${scene.end * 100}% top`,
            scrub: 0.6,
          },
        });

        if (index === 0) {
          gsap.set(targets, { yPercent: 0, opacity: 1 });
          gsap.set(el, { autoAlpha: 1 });
          tl.to(el, { autoAlpha: 1, duration: 0.6 })
            .to(
              targets,
              { yPercent: -120, opacity: 0, stagger: 0.03, duration: 0.5, ease: "power2.in" },
              0.55
            )
            .set(el, { autoAlpha: 0 });
        } else {
          const isLast = index === heroScenes.length - 1;
          gsap.set(el, { autoAlpha: 0 });
          gsap.set(targets, { yPercent: 120, opacity: 0 });
          tl.set(el, { autoAlpha: 1 }).to(targets, {
            yPercent: 0,
            opacity: 1,
            stagger: 0.04,
            duration: 0.4,
            ease: "power3.out",
          });
          if (!isLast) {
            tl.to({}, { duration: 0.5 }).to(targets, {
              yPercent: -120,
              opacity: 0,
              stagger: 0.02,
              duration: 0.35,
              ease: "power2.in",
            });
          }
        }
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="hero" ref={root} className="relative">
      <div className="hero-driver relative h-[340svh]">
        <div className="sticky top-0 flex h-svh items-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/3 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-steel/10 blur-[150px]" />
            <div className="absolute -right-32 bottom-0 h-[36rem] w-[36rem] rounded-full bg-bronze/10 blur-[130px]" />
          </div>

          <div
            className="hero-stage pointer-events-none absolute inset-0"
            style={{ transformStyle: "preserve-3d", perspective: "1600px" }}
          >
            {cards.map((item, i) => (
              <div
                key={item.src}
                className={`hero-card absolute overflow-hidden rounded-xl border border-steel-400/25 shadow-2xl ${CARD_SLOTS[i]}`}
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover opacity-70"
                  priority={i < 2}
                />
                <div className="absolute inset-0 bg-ink/20" />
              </div>
            ))}
          </div>

          <div className="shell relative z-10 w-full">
            {heroScenes.map((scene) => (
              <div
                key={scene.id}
                // Full shell width for every scene; centering is done with
                // text-align only. The old left-1/2 + -translate-x-1/2 +
                // inset-x combo shrank the box to ~half the viewport and the
                // 60rem cap clipped oversized words inside the line masks.
                className={`hero-scene absolute inset-x-[var(--shell-x)] top-1/2 -translate-y-1/2 ${
                  scene.align === "center" ? "text-center" : ""
                }`}
              >
                {scene.eyebrow && <p className="hero-body eyebrow mb-5">{scene.eyebrow}</p>}
                <h1
                  className={
                    scene.align === "center"
                      ? // Word-safe fluid size for the long centered headline
                        // ("MARKETING" must fit unbroken inside the shell).
                        "display-hero text-[clamp(2.5rem,8vw,8.5rem)]"
                      : "display-hero"
                  }
                >
                  {scene.title.map((line, i) => (
                    <span key={i} className={i === 1 && scene.id === "name" ? "text-champagne" : ""}>
                      <Words text={line} />
                    </span>
                  ))}
                </h1>
                {scene.body && (
                  <p className={`hero-body lede mt-6 ${scene.align === "center" ? "mx-auto" : ""} max-w-2xl`}>
                    {scene.body}
                  </p>
                )}
                {scene.cta && (
                  <div className={`hero-body mt-9 flex flex-wrap gap-4 ${scene.align === "center" ? "justify-center" : ""}`}>
                    <TransitionLink href="#work" intent="section" label="WORK" className="btn-primary">
                      View Work
                    </TransitionLink>
                    <TransitionLink
                      href="#case-studies"
                      intent="section"
                      label="CASE FILE"
                      className="btn-ghost"
                    >
                      Explore Case Studies
                    </TransitionLink>
                    <TransitionLink href="#contact" intent="section" label="SULTAN" className="btn-ghost">
                      Contact
                    </TransitionLink>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-[9svh] left-1/2 z-20 w-[240px] -translate-x-1/2">
            <div className="relative h-px w-full bg-mist/10">
              <div
                ref={barRef}
                className="absolute inset-0 origin-left bg-gradient-to-r from-bronze to-champagne"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <div className="mt-2 flex justify-between font-display text-[0.6rem] tracking-[0.2em] text-haze/50">
              <span>{profile.name}</span>
              <span ref={pctRef}>000%</span>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 left-[var(--shell-x)] z-20 flex items-center gap-2 text-haze/50">
            <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden />
            <span className="font-display text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}
