"use client";

import { useEffect, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { results } from "@/lib/data/results";
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
    <div className="group relative overflow-hidden rounded-2xl border border-steel-400/25 bg-ink p-7 transition-colors duration-500 hover:border-champagne/30">
      <p className="font-display text-3xl font-bold text-mist-300 md:text-4xl">
        {display}
      </p>
      <p className="mt-3 font-display text-[0.7rem] uppercase tracking-[0.2em] text-champagne/80">
        {label}
      </p>
      <p className="mt-1 text-[0.68rem] text-haze/50">{context}</p>
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
    <Section id="results">
      <SectionHeader
        index="07"
        eyebrow="Results"
        title="Performance, proven"
        intro="Selected campaign snapshots from real accounts. Figures represent individual campaign periods, not lifetime totals."
      />
      <div
        ref={ref}
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {results.map((m) => (
          <MetricCard key={`${m.label}-${m.value}`} {...m} start={start} />
        ))}
      </div>
      <p className="mt-8 text-[0.68rem] uppercase tracking-[0.2em] text-haze/40">
        * Selected campaign snapshots — labelled to avoid over-claiming aggregate performance.
      </p>
    </Section>
  );
}
