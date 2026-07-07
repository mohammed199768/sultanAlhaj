"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import styles from "./PageTransitionOverlay.module.css";

export interface PageTransitionOverlayRefs {
  root: HTMLDivElement | null;
  bronze: HTMLDivElement | null;
  navy: HTMLDivElement | null;
  svg: SVGSVGElement | null;
  word: HTMLHeadingElement | null;
  caption: HTMLParagraphElement | null;
  line: HTMLDivElement | null;
  edge: HTMLDivElement | null;
}

interface Props {
  label: string;
}

const PageTransitionOverlay = forwardRef<PageTransitionOverlayRefs, Props>(
  function PageTransitionOverlay({ label }, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const bronzeRef = useRef<HTMLDivElement>(null);
    const navyRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const wordRef = useRef<HTMLHeadingElement>(null);
    const captionRef = useRef<HTMLParagraphElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const edgeRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      root: rootRef.current,
      bronze: bronzeRef.current,
      navy: navyRef.current,
      svg: svgRef.current,
      word: wordRef.current,
      caption: captionRef.current,
      line: lineRef.current,
      edge: edgeRef.current,
    }));

    return (
      <div
        ref={rootRef}
        className={styles.overlay}
        aria-hidden="true"
      >
        <div ref={bronzeRef} className={styles.bronze} />
        <div ref={navyRef} className={styles.navy} />
        <svg
          ref={svgRef}
          className={styles.svgVeil}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 100 V 42 Q 50 12 100 42 V 100 z"
            fill="currentColor"
          />
        </svg>
        <div ref={lineRef} className={styles.line} />
        <div ref={edgeRef} className={styles.edge} />
        <div className={styles.content}>
          <h2 ref={wordRef} className={styles.word}>
            {label}
          </h2>
          <p ref={captionRef} className={styles.caption}>
            Sultan Shadi portfolio
          </p>
        </div>
      </div>
    );
  }
);

export default PageTransitionOverlay;
