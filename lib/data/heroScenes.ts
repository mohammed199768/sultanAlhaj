/**
 * Hero scene model — inspired by codrops variant-2 `scenePerspectives`.
 * Each scene owns a scroll-progress window (0..1) and reveals in → holds → out.
 */
export interface HeroScene {
  id: string;
  eyebrow?: string;
  title: string[]; // lines (each animates as words)
  body?: string;
  align: "left" | "center";
  start: number;
  end: number;
  cta?: boolean;
}

export const heroScenes: HeroScene[] = [
  {
    id: "name",
    eyebrow: "Amman, Jordan · Riyadh, Saudi Arabia",
    title: ["Sultan", "Shadi"],
    body: "Sultan Alhaj Ahmad",
    align: "left",
    start: 0,
    end: 0.34,
  },
  {
    id: "title",
    eyebrow: "The role",
    title: ["Digital Marketing", "Manager & Brand", "Specialist"],
    body: "Marketing strategist building brands, campaigns, and market presence across Jordan and Saudi Arabia.",
    align: "center",
    start: 0.34,
    end: 0.68,
  },
  {
    id: "cta",
    eyebrow: "Let's work",
    title: ["Brands", "that convert"],
    body: "Strategy, branding, content and performance — end to end.",
    align: "left",
    start: 0.68,
    end: 1,
    cta: true,
  },
];
