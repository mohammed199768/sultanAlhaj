"use client";

import { gsap } from "./gsap";

/**
 * Section boundary transition engine.
 * Codrops barba-page-transition language (clip-path covers, layered wipes,
 * staggered panels, ghost typography bands) rebuilt as scroll-triggered
 * section transitions. Transform / clip-path / opacity only — no pinning,
 * no scroll blocking, pointer-events stay off.
 */

export type PresetName = "edge-wipe" | "vertical-mask" | "panels";

export interface BoundaryConfig {
  preset: PresetName;
  /** Optional ScrollTrigger start override for this boundary. */
  start?: string;
  /** Ghost word (Unbounded) that rides the cover. */
  word?: string;
  /** Main cover color (CSS color / var). */
  panel: string;
  /** Leading / trailing edge layer color. */
  edge: string;
  /** For the panels preset: curtain columns or strip rows. */
  orientation?: "vertical" | "horizontal";
}

export interface BoundaryEls {
  root: HTMLElement;
  panelA: HTMLElement;
  panelB: HTMLElement;
  strips: HTMLElement[];
  line: HTMLElement;
  wordWrap: HTMLElement | null;
  word: HTMLElement | null;
}

import {
  beginHeavyTransition,
  endHeavyTransition,
  isHeavyTransitionActive,
} from "./motionState";

/**
 * One major transition layer at a time — a boundary cannot start while
 * another boundary OR the route overlay is active. A short cooldown after
 * each boundary prevents replay on small scroll jiggles around a marker.
 */
let locked = false;
let cooldownUntil = 0;
const BOUNDARY_COOLDOWN_MS = 900;

export function tryAcquireBoundaryLock(): boolean {
  if (locked || isHeavyTransitionActive()) return false;
  if (performance.now() < cooldownUntil) return false;
  locked = true;
  beginHeavyTransition();
  return true;
}
export function releaseBoundaryLock(): void {
  if (!locked) return;
  locked = false;
  cooldownUntil = performance.now() + BOUNDARY_COOLDOWN_MS;
  endHeavyTransition();
}

type Dir = 1 | -1; // 1 = scrolling down (wipe travels upward), -1 = scrolling up

const HOLD = 0.05;

function hideAllLayers(els: BoundaryEls) {
  gsap.set([els.panelA, els.panelB, els.line, ...els.strips], {
    clearProps: "all",
    autoAlpha: 0,
  });
  if (els.word) gsap.set(els.word, { clearProps: "all", autoAlpha: 0 });
}

/**
 * Ghost word: enters during the cover, exits together with the reveal.
 * Runs fully inside the cover->reveal window — it must never extend the
 * timeline serially (that was the source of the "skipped section" feel).
 */
function addWord(
  tl: gsap.core.Timeline,
  els: BoundaryEls,
  dir: Dir,
  coverAt: number,
  speed = 1
) {
  if (!els.word) return;
  gsap.set(els.word, { yPercent: 118 * dir, autoAlpha: 1 });
  tl.to(
    els.word,
    { yPercent: 0, duration: 0.35 * speed, ease: "power4.out" },
    coverAt
  );
  tl.to(
    els.word,
    { yPercent: -118 * dir, duration: 0.3 * speed, ease: "power3.in", overwrite: "auto" },
    "reveal"
  );
}

function insetFrom(dir: Dir) {
  return dir === 1 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)";
}
function insetExit(dir: Dir) {
  return dir === 1 ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)";
}
const INSET_FULL = "inset(0% 0 0% 0)";

/** Two-layer directional cover: edge leads, panel fills, both exit forward. */
function edgeWipe(tl: gsap.core.Timeline, els: BoundaryEls, dir: Dir, speed: number) {
  gsap.set([els.panelA, els.panelB], { autoAlpha: 1, clipPath: insetFrom(dir) });

  tl.to(els.panelA, { clipPath: INSET_FULL, duration: 0.5 * speed, ease: "power4.inOut" }, 0);
  tl.to(els.panelB, { clipPath: INSET_FULL, duration: 0.5 * speed, ease: "power4.inOut" }, 0.09 * speed);
  tl.addLabel("reveal", 0.09 * speed + 0.5 * speed + HOLD);
  addWord(tl, els, dir, 0.2 * speed, speed);
  tl.to(els.panelB, { clipPath: insetExit(dir), duration: 0.55 * speed, ease: "power3.inOut" }, "reveal");
  tl.to(els.panelA, { clipPath: insetExit(dir), duration: 0.55 * speed, ease: "power3.inOut" }, `reveal+=${0.08 * speed}`);
}

/** Codrops example-4: center line → band expands to full cover → exits forward. */
function verticalMask(tl: gsap.core.Timeline, els: BoundaryEls, dir: Dir, speed: number) {
  gsap.set(els.line, { autoAlpha: 1, scaleX: 0, transformOrigin: "left center" });
  gsap.set(els.panelB, { autoAlpha: 1, clipPath: "inset(49.8% 0 49.8% 0)" });

  tl.to(els.line, { scaleX: 1, duration: 0.38 * speed, ease: "power2.out" }, 0);
  tl.to(
    els.panelB,
    { clipPath: INSET_FULL, duration: 0.6 * speed, ease: "expo.inOut" },
    0.22 * speed
  );
  tl.addLabel("reveal", 0.22 * speed + 0.6 * speed + HOLD);
  tl.set(els.line, { autoAlpha: 0 }, `reveal-=${0.05 * speed}`);
  addWord(tl, els, dir, 0.3 * speed, speed);
  tl.to(els.panelB, { clipPath: insetExit(dir), duration: 0.55 * speed, ease: "power3.inOut" }, "reveal");
}

/** Staggered curtain / strip / shutter panels. */
function panels(
  tl: gsap.core.Timeline,
  els: BoundaryEls,
  dir: Dir,
  speed: number,
  orientation: "vertical" | "horizontal"
) {
  const vertical = orientation === "vertical";
  const prop = vertical ? "scaleY" : "scaleX";
  const coverOrigin = vertical
    ? dir === 1
      ? "center bottom"
      : "center top"
    : dir === 1
      ? "left center"
      : "right center";
  const exitOrigin = vertical
    ? dir === 1
      ? "center top"
      : "center bottom"
    : dir === 1
      ? "right center"
      : "left center";

  gsap.set(els.strips, { autoAlpha: 1, [prop]: 0, transformOrigin: coverOrigin });

  const stagger = 0.055 * speed;
  tl.to(
    els.strips,
    { [prop]: 1, duration: 0.48 * speed, ease: "power3.inOut", stagger },
    0
  );
  tl.addLabel("reveal", 0.48 * speed + stagger * 4 + HOLD);
  addWord(tl, els, dir, 0.24 * speed, speed);
  tl.set(els.strips, { transformOrigin: exitOrigin }, "reveal");
  tl.to(
    els.strips,
    { [prop]: 0, duration: 0.48 * speed, ease: "power3.inOut", stagger },
    "reveal"
  );
}

/**
 * Build the full cover→reveal timeline for one boundary crossing.
 * `simplified` (mobile / coarse pointer): single lightweight edge wipe.
 */
export function buildBoundaryTimeline(
  els: BoundaryEls,
  config: BoundaryConfig,
  dir: Dir,
  simplified: boolean,
  onSettled?: () => void
): gsap.core.Timeline {
  const preset: PresetName = simplified ? "edge-wipe" : config.preset;
  // 0.5 global scale + reveal anchored to cover end keeps the entire
  // cover->reveal around 0.5-0.6s (visual only, no scroll manipulation).
  const speed = (simplified ? 0.85 : 1) * 0.5;

  const tl = gsap.timeline({
    paused: true,
    onStart: () => {
      gsap.set(els.root, { autoAlpha: 1 });
    },
    onComplete: () => {
      gsap.set(els.root, { autoAlpha: 0 });
      hideAllLayers(els);
      releaseBoundaryLock();
      onSettled?.();
    },
    onInterrupt: () => {
      gsap.set(els.root, { autoAlpha: 0 });
      hideAllLayers(els);
      releaseBoundaryLock();
      onSettled?.();
    },
  });

  hideAllLayers(els);

  switch (preset) {
    case "vertical-mask":
      verticalMask(tl, els, dir, speed);
      break;
    case "panels":
      panels(tl, els, dir, speed, config.orientation ?? "vertical");
      break;
    default:
      edgeWipe(tl, els, dir, speed);
  }

  return tl;
}
