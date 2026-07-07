import localFont from "next/font/local";

/**
 * Unbounded — display face for headings, hero, nav, numbers, labels.
 * Self-hosted from /fonts (SIL OFL).
 */
export const unbounded = localFont({
  src: [
    { path: "../fonts/Unbounded-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Unbounded-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Unbounded-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Unbounded-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Unbounded-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/Unbounded-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../fonts/Unbounded-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-unbounded",
  display: "swap",
});

/**
 * Tinos — editorial serif for paragraphs and case-study copy.
 */
export const tinos = localFont({
  src: [
    { path: "../fonts/Tinos-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Tinos-Italic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/Tinos-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-tinos",
  display: "swap",
});
