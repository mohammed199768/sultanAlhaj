"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/motion/reducedMotion";
import type { MediaItem } from "@/lib/manifest/types";
import MobileHero from "./MobileHero";

const DesktopCinematicOpening = dynamic(() => import("./CinematicOpeningDesktop"), {
  ssr: false,
  loading: () => null,
});

const MOBILE_QUERY = "(max-width: 639.98px)";
const DESKTOP_QUERY = "(min-width: 640px)";

export default function CinematicOpening({
  previews,
  mobilePreview,
}: {
  previews: MediaItem[];
  mobilePreview?: MediaItem | null;
}) {
  const mobile = useMediaQuery(MOBILE_QUERY);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const fallbackPreview = previews.find((item) => item.kind === "image") ?? null;

  if (mobile) {
    return <MobileHero image={mobilePreview ?? fallbackPreview} />;
  }

  if (desktop) {
    return <DesktopCinematicOpening previews={previews} />;
  }

  return null;
}
