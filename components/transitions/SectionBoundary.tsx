"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion/gsap";
import {
  prefersReducedMotion,
  COARSE_POINTER_QUERY,
} from "@/lib/motion/reducedMotion";
import {
  buildBoundaryTimeline,
  tryAcquireBoundaryLock,
  releaseBoundaryLock,
  type BoundaryEls,
} from "@/lib/motion/sectionTransitions";
import { sectionBoundaries, type BoundaryName } from "@/lib/motion/transitionPresets";
import styles from "./SectionBoundary.module.css";

const DEFAULT_BOUNDARY_START = "top 52%";

/**
 * Cinematic boundary between two homepage sections.
 * Renders a 1px scroll marker plus a fixed overlay; crossing the marker
 * plays a Codrops-style cover→reveal wipe (direction-aware, one at a time).
 * Reduced motion: fully disabled. Never intercepts pointer events or scroll.
 */
export default function SectionBoundary({ name }: { name: BoundaryName }) {
  const config = sectionBoundaries[name];
  const markerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (prefersReducedMotion()) return;

      const marker = markerRef.current;
      const root = rootRef.current;
      if (!marker || !root) return;

      const els: BoundaryEls = {
        root,
        panelA: root.querySelector<HTMLElement>(`.${styles.panelA}`)!,
        panelB: root.querySelector<HTMLElement>(`.${styles.panelB}`)!,
        strips: Array.from(root.querySelectorAll<HTMLElement>(`.${styles.strip}`)),
        line: root.querySelector<HTMLElement>(`.${styles.line}`)!,
        wordWrap: root.querySelector<HTMLElement>(`.${styles.wordWrap}`),
        word: root.querySelector<HTMLElement>(`.${styles.word}`),
      };

      // Boundaries are desktop-only (1024px+). Below lg the overlay stays
      // hidden and no ScrollTrigger/timeline/lock ever exists — the page
      // scrolls naturally section to section. gsap.matchMedia re-runs this
      // setup on resize across the threshold, so no reload is needed.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Coarse-pointer desktops (touch laptops) keep the lighter wipe.
        const simplified = window.matchMedia(COARSE_POINTER_QUERY).matches;

        let timeline: gsap.core.Timeline | null = null;
        let ownsBoundaryLock = false;

        const play = (dir: 1 | -1) => {
          if (!tryAcquireBoundaryLock()) return;
          ownsBoundaryLock = true;
          timeline?.kill();
          // Builder's onComplete hides the overlay and releases the lock.
          timeline = buildBoundaryTimeline(els, config, dir, simplified, () => {
            ownsBoundaryLock = false;
          });
          timeline.play(0);
        };

        // Start only once the next section's boundary is close to the viewport
        // center. Starting at 70% announced later sections while the previous
        // section still owned most of the viewport.
        const trigger = ScrollTrigger.create({
          trigger: marker,
          start: ("start" in config ? config.start : undefined) ?? DEFAULT_BOUNDARY_START,
          onEnter: () => play(1),
          onLeaveBack: () => play(-1),
        });

        return () => {
          trigger.kill();
          if (ownsBoundaryLock) releaseBoundaryLock();
          timeline?.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: markerRef, dependencies: [name] }
  );

  return (
    <div
      ref={markerRef}
      className={styles.marker}
      data-section-boundary={name}
      aria-hidden="true"
    >
      <div
        ref={rootRef}
        className={styles.root}
        style={
          {
            "--boundary-panel": config.panel,
            "--boundary-edge": config.edge,
          } as React.CSSProperties
        }
      >
        <div className={styles.panelA} />
        <div className={styles.panelB} />
        <div
          className={styles.strips}
          data-orientation={"orientation" in config ? config.orientation : "vertical"}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={styles.strip} />
          ))}
        </div>
        <div className={styles.line} />
        {"word" in config && config.word ? (
          <div className={styles.wordWrap}>
            <span className={styles.word}>{config.word}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
