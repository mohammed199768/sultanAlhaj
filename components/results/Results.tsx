"use client";

import { useEffect, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import home from "@/content/home.json";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";

/** Animate a numeric value up when it scrolls into view (respects reduced motion). */
function useCountUp(target: string, start: boolean) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!start) return;
    const reduce = prefersReducedMotion();
    // Parse leading number; keep prefix/suffix (e.g. "+", "%", "K").
    const match = target.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (reduce || !match) {
      setDisplay(target);
      return;
    }
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, "");
    const suffix = match[3];
    const end = parseFloat(numStr);
    const hasDecimal = numStr.includes(".");
    const duration = 1400;
    const t0 = performance.now();
    let raf = 0;

    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = end * eased;
      const formatted = hasDecimal
        ? current.toFixed(2)
        : Math.round(current).toLocaleString("en-US");
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);

  return display;
}

function MetricCard({
  value,
  label,
  context,
  start,
}: {
  value: string;
  label: string;
  context: string;
  start: boolean;
}) {
  const display = useCountUp(value, start);
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-steel-400/25 bg-ink p-5 transition-colors duration-500 hover:border-champagne/30 sm:p-7">
      <p className="min-w-0 overflow-hidden break-words font-display text-[clamp(1.8rem,11vw,2.75rem)] font-bold leading-none text-mist-300 sm:text-3xl md:text-4xl">
        {display}
      </p>
      <p className="mt-3 min-w-0 break-words font-display text-[0.68rem] uppercase leading-relaxed tracking-[0.14em] text-champagne/80 sm:text-[0.7rem] sm:tracking-[0.2em]">
        {label}
      </p>
      <p className="mt-1 min-w-0 break-words text-[0.68rem] leading-relaxed text-haze/50">
        {context}
      </p>
    </div>
  );
}

export default function Results() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStart(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="results" containerClassName="min-w-0 overflow-x-hidden">
      <SectionHeader
        index={home.results.index}
        eyebrow={home.results.eyebrow}
        title={home.results.title}
        intro={home.results.intro}
        className="min-w-0 max-w-full [&_.lede]:break-words [&_.lede]:[overflow-wrap:anywhere]"
      />
      <div
        ref={ref}
        className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {home.results.items.map((m) => (
          <MetricCard key={`${m.label}-${m.value}`} {...m} start={start} />
        ))}
      </div>
      <p className="mt-8 min-w-0 max-w-full break-words text-[0.68rem] uppercase leading-relaxed tracking-[0.12em] text-haze/40 [overflow-wrap:anywhere] sm:tracking-[0.2em]">
        {home.results.note}
      </p>
    </Section>
  );
}
