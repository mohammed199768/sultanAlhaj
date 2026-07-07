"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion/gsap";

export default function RouteTransitionLayer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.fromTo(
      el,
      { opacity: 0.88, y: 18, clipPath: "inset(1.5rem 0 0 0)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0rem 0 0 0)",
        duration: 0.72,
        ease: "power3.out",
        clearProps: "opacity,transform,clipPath",
      }
    );
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
