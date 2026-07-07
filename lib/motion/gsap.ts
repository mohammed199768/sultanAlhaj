"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register GSAP plugins exactly once (client only). */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

// Re-export so existing imports keep working; implementation lives in a
// gsap-free module so non-GSAP components don't pull gsap into their chunk.
export { prefersReducedMotion } from "./reducedMotion";

export { gsap, ScrollTrigger };
