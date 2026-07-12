"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import { useMediaQuery } from "@/lib/motion/reducedMotion";
import type { MediaItem } from "@/lib/manifest/types";
import MobileHero from "./MobileHero";

function OpeningPlaceholder() {
  return (
    <div
      aria-hidden
      className="h-[100dvh] bg-navy-600 sm:h-[380svh]"
      data-home-opening-placeholder=""
    />
  );
}

const DesktopCinematicOpening = dynamic(() => import("./CinematicOpeningDesktop"), {
  ssr: false,
  loading: OpeningPlaceholder,
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
  const markLayoutReady = useCallback(() => {
    document.documentElement.dataset.homeLayoutReady = "true";
    window.dispatchEvent(new CustomEvent("sultan:home-layout-ready"));
  }, []);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.homeLayoutReady;
    };
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const frame = window.requestAnimationFrame(markLayoutReady);
    return () => window.cancelAnimationFrame(frame);
  }, [markLayoutReady, mobile]);

  if (mobile) {
    return <MobileHero image={mobilePreview ?? fallbackPreview} />;
  }

  if (desktop) {
    return (
      <DesktopCinematicOpening
        previews={previews}
        onLayoutReady={markLayoutReady}
      />
    );
  }

  return <OpeningPlaceholder />;
}
