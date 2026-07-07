"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import {
  isHeavyTransitionActive,
  onHeavyTransitionChange,
} from "@/lib/motion/motionState";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "li" | "section" | "article";
}

/**
 * Lightweight scroll-reveal using IntersectionObserver.
 * CSS in globals.css handles the transition and reduced-motion no-op.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let unsubscribe: (() => void) | null = null;
    let timer: number | null = null;

    const show = () => {
      el.classList.add("is-visible");
      // Release the will-change hint once the reveal transition ends.
      el.addEventListener(
        "transitionend",
        () => {
          el.style.willChange = "auto";
        },
        { once: true }
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(el);
          if (isHeavyTransitionActive()) {
            // A boundary/route overlay is covering the screen: wait for it
            // to finish (plus a small settle buffer) before revealing, so
            // the entrance never runs hidden under - or fighting - the cover.
            unsubscribe = onHeavyTransitionChange((active) => {
              if (active) return;
              unsubscribe?.();
              unsubscribe = null;
              timer = window.setTimeout(show, 80);
            });
          } else {
            show();
          }
        });
      },
      // Starts slightly lower than before (-14%) so section entrances begin
      // after the boundary transition, never at the same instant.
      { threshold: 0.12, rootMargin: "0px 0px -14% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unsubscribe?.();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
