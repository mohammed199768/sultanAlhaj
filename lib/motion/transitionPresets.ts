import type { BoundaryConfig } from "./sectionTransitions";

/**
 * Boundary map for the homepage — reduced to the 5 major boundaries and
 * 3 presets (edge-wipe, vertical-mask, panels). Minor boundaries carry no
 * overlay: section entrances (Reveal) are enough there. The radial preset
 * was removed — it duplicated the orbit language of the Clients section.
 * Colors stay inside the Sultan palette via CSS variables.
 */
export const sectionBoundaries = {
  "hero-about": {
    preset: "edge-wipe",
    word: "SULTAN",
    panel: "var(--ink)",
    edge: "var(--champagne)",
    // Fires later so the hero cinematic scroll has fully settled first.
    start: "top 55%",
  },
  "experience-work": {
    preset: "panels",
    orientation: "horizontal",
    word: "WORK",
    panel: "var(--ink)",
    edge: "var(--bronze)",
  },
  "work-clients": {
    preset: "vertical-mask",
    word: "CLIENTS",
    panel: "var(--ink)",
    edge: "var(--champagne)",
  },
  "results-reels": {
    preset: "panels",
    orientation: "vertical",
    word: "STORIES",
    panel: "var(--ink)",
    edge: "var(--champagne)",
  },
  "tools-contact": {
    preset: "vertical-mask",
    word: "CONTACT",
    panel: "var(--ink)",
    edge: "var(--champagne)",
  },
} satisfies Record<string, BoundaryConfig>;

export type BoundaryName = keyof typeof sectionBoundaries;
