"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

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
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
            // Release the will-change hint once the reveal transition ends.
            el.addEventListener(
              "transitionend",
              () => {
                el.style.willChange = "auto";
              },
              { once: true }
            );
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
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
