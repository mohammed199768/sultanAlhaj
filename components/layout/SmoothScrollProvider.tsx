"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion/gsap";

/**
 * Single source of truth for scroll + motion.
 * Mounts Lenis smooth scroll and drives GSAP ScrollTrigger from its RAF loop.
 * Fully disabled under prefers-reduced-motion.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    registerGsap();

    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anchor links routed through Lenis.
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!target) return;
      const id = target.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        // -96 clears the fixed 80px header (matches sections' scroll-mt-24,
        // which Lenis does not read).
        lenis.scrollTo(el as HTMLElement, { offset: -96 });
      }
    };
    document.addEventListener("click", onClick);

    const onTransitionScroll = (e: Event) => {
      const target = (e as CustomEvent<{ target?: string }>).detail?.target;
      if (!target) return;
      const el = document.querySelector(target);
      if (el) lenis.scrollTo(el as HTMLElement, { offset: -96, immediate: true });
    };
    window.addEventListener("sultan:scroll-to", onTransitionScroll);

    const onTransitionComplete = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("sultan:route-transition-complete", onTransitionComplete);

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("sultan:scroll-to", onTransitionScroll);
      window.removeEventListener("sultan:route-transition-complete", onTransitionComplete);
      gsap.ticker.remove(raf);
      lenis.destroy();
      clearTimeout(refresh);
    };
  }, []);

  return <>{children}</>;
}
