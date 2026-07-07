"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { MediaItem } from "@/lib/manifest/types";

/** Draggable, cinematic horizontal carousel of vertical testimonial cards. */
export default function ReelsCarousel({ items }: { items: MediaItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [constraint, setConstraint] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      setConstraint(Math.max(0, el.scrollWidth - el.offsetWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-steel-400/35 py-20 text-center text-sm text-haze/50">
        Testimonials coming soon.
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        ref={trackRef}
        className="no-scrollbar flex cursor-grab gap-5 active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -constraint, right: 0 }}
        dragElastic={0.08}
      >
        {items.map((item, i) => (
          <motion.figure
            key={item.src}
            className="relative aspect-[9/16] w-[68vw] flex-none overflow-hidden rounded-2xl border border-navy-500/80 bg-navy-500/30 shadow-2xl sm:w-[42vw] md:w-[22rem]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.06 }}
          >
            <Image
              src={item.src}
              alt={`Client testimonial ${i + 1}`}
              fill
              draggable={false}
              sizes="(max-width: 640px) 68vw, 22rem"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          </motion.figure>
        ))}
      </motion.div>

      <p className="mt-6 flex items-center gap-2 font-display text-[0.6rem] uppercase tracking-[0.25em] text-haze/40">
        <span className="h-px w-8 bg-champagne/50" /> Drag to explore
      </p>
    </div>
  );
}
