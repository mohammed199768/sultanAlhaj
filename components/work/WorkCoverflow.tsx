"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, FileText, Images, ArrowUpRight } from "lucide-react";
import ImageAsset from "@/components/media/ImageAsset";
import TransitionLink from "@/components/transitions/TransitionLink";
import WorkFilters from "./WorkFilters";
import Lightbox from "./Lightbox";
import type { ProjectPopupData } from "@/lib/content/types";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";
import { isHeavyTransitionActive } from "@/lib/motion/motionState";

/**
 * Cinematic centered 3D coverflow (adapted from new_inkspir's Swiper "creative"
 * effect, rebuilt with Framer Motion — no extra dependency).
 * Neighbours translate/rotate/scale/fade away from the focused slide.
 */
export default function WorkCoverflow({
  projects,
  categories,
}: {
  projects: ProjectPopupData[];
  categories: string[];
}) {
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<ProjectPopupData | null>(null);
  const [paused, setPaused] = useState(false);
  const touchPauseTimer = useRef<number | null>(null);

  const list = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects]
  );

  const count = list.length;
  const clampActive = active % Math.max(count, 1);

  const go = useCallback(
    (dir: number) => setActive((a) => (a + dir + count) % Math.max(count, 1)),
    [count]
  );

  const openFocusedProject = useCallback(() => {
    const project = list[clampActive];
    if (project) setSelected(project);
  }, [clampActive, list]);

  const pauseForTouch = useCallback(() => {
    setPaused(true);
    if (touchPauseTimer.current) {
      window.clearTimeout(touchPauseTimer.current);
    }
    touchPauseTimer.current = window.setTimeout(() => {
      touchPauseTimer.current = null;
      setPaused(false);
    }, 1800);
  }, []);

  useEffect(() => {
    return () => {
      if (touchPauseTimer.current) window.clearTimeout(touchPauseTimer.current);
    };
  }, []);

  // Reset when filter changes
  useEffect(() => setActive(0), [filter]);

  // Autoplay
  useEffect(() => {
    if (paused || count <= 1 || selected) return;
    if (prefersReducedMotion()) return;
    const t = setInterval(() => {
      // Don't advance slides beneath an active boundary/route overlay.
      if (isHeavyTransitionActive()) return;
      go(1);
    }, 4200);
    return () => clearInterval(t);
  }, [paused, count, selected, go]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, selected]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <WorkFilters categories={categories} active={filter} onChange={setFilter} />

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-steel-400/35 py-24 text-center">
          <p className="font-display text-sm uppercase tracking-[0.25em] text-haze/60">
            No projects in this category yet
          </p>
          <button
            type="button"
            onClick={() => setFilter("All")}
            className="mt-4 text-xs text-champagne underline underline-offset-4"
          >
            View all work
          </button>
        </div>
      ) : (
        <>
          {/* Stage */}
          <div
            className="relative mx-auto flex h-[62vh] max-h-[640px] min-h-[420px] w-full items-center justify-center"
            style={{ perspective: "1800px" }}
          >
            {list.map((project, i) => {
              // shortest signed offset around the ring
              let offset = i - clampActive;
              if (offset > count / 2) offset -= count;
              if (offset < -count / 2) offset += count;

              const abs = Math.abs(offset);
              const isCenter = offset === 0;
              const visible = abs <= 2;
              const dir = Math.sign(offset);

              const style: React.CSSProperties = {
                transform: `translateX(${offset * 42}%) translateZ(${-abs * 240}px) rotateY(${-dir * 26}deg) scale(${isCenter ? 1 : 0.9})`,
                opacity: visible ? (isCenter ? 1 : 0.55) : 0,
                zIndex: 50 - abs,
                pointerEvents: visible ? "auto" : "none",
                transition:
                  "transform 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.8s cubic-bezier(0.16,1,0.3,1)",
              };

              return (
                <motion.article
                  key={project.key}
                  className="absolute h-full w-[84vw] max-w-[1040px] md:w-[70vw]"
                  style={style}
                  aria-hidden={!isCenter}
                >
                  <button
                    type="button"
                    onClick={() => (isCenter ? setSelected(project) : setActive(i))}
                    aria-label={isCenter ? `Open ${project.identity.title}` : `Focus ${project.identity.title}`}
                    className="group relative block h-full w-full overflow-hidden rounded-2xl border border-steel-400/25 bg-surface-2 text-left"
                  >
                    {project.cover && project.cover.kind === "image" ? (
                      <ImageAsset
                        item={project.cover}
                        sizes="(max-width: 768px) 84vw, 70vw"
                        priority={isCenter}
                        className="pointer-events-none select-none transition-transform duration-[1200ms] ease-cinema group-hover:scale-105"
                      />
                    ) : project.cover?.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.cover.poster}
                        alt={project.identity.title}
                        className="pointer-events-none h-full w-full select-none object-cover"
                      />
                    ) : (
                      <div className="pointer-events-none flex h-full items-center justify-center bg-gradient-to-br from-surface-2 to-ink">
                        <span className="font-display text-xs uppercase tracking-[0.3em] text-haze/50">
                          {project.identity.title}
                        </span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

                    {/* Media chips */}
                    <div className="pointer-events-none absolute right-4 top-4 flex gap-1.5">
                      {project.counts.videos > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[0.55rem] text-mist backdrop-blur">
                          <Play className="h-2.5 w-2.5" aria-hidden /> {project.counts.videos}
                        </span>
                      )}
                      {project.counts.pdfs > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[0.55rem] text-mist backdrop-blur">
                          <FileText className="h-2.5 w-2.5" aria-hidden /> {project.counts.pdfs}
                        </span>
                      )}
                      {project.counts.images > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[0.55rem] text-mist backdrop-blur">
                          <Images className="h-2.5 w-2.5" aria-hidden /> {project.counts.images}
                        </span>
                      )}
                    </div>

                    {/* Caption (focused only) */}
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 transition-opacity duration-500 md:p-9"
                      style={{ opacity: isCenter ? 1 : 0 }}
                    >
                      <div>
                        <p className="font-display text-[0.62rem] uppercase tracking-[0.28em] text-champagne/85">
                          {project.category}
                        </p>
                        <h3 className="mt-2 font-display text-2xl font-semibold text-mist-300 md:text-4xl">
                          {project.identity.title}
                        </h3>
                        <p className="mt-2 hidden max-w-md text-sm text-haze/75 md:block">
                          {project.summary}
                        </p>
                      </div>
                      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-champagne text-ink transition-transform duration-500 group-hover:scale-110">
                        <ArrowUpRight className="h-5 w-5" aria-hidden />
                      </span>
                    </div>
                  </button>
                </motion.article>
              );
            })}

            {/* Drag layer for touch/swipe */}
            <motion.div
              className="absolute inset-0 z-[60] md:hidden"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onPointerDown={pauseForTouch}
              onTap={openFocusedProject}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              role="button"
              tabIndex={-1}
              aria-label={
                list[clampActive]
                  ? `Open ${list[clampActive].identity.title} gallery`
                  : "Open focused project gallery"
              }
              style={{ touchAction: "pan-y" }}
            />

            {/* Arrows */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous project"
              className="absolute left-2 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-steel-400/35 bg-ink/50 text-mist-300 backdrop-blur transition-colors hover:border-champagne hover:text-champagne md:left-6"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next project"
              className="absolute right-2 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-steel-400/35 bg-ink/50 text-mist-300 backdrop-blur transition-colors hover:border-champagne hover:text-champagne md:right-6"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Footer: counter + dots + full-case link */}
          <div className="mt-8 flex flex-col items-center gap-5">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {list.map((p, i) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Go to ${p.identity.title}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === clampActive ? "w-8 bg-champagne" : "w-1.5 bg-mist/20 hover:bg-mist/40"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-6 font-display text-[0.65rem] uppercase tracking-[0.25em] text-haze/60">
              <span>
                <span className="text-mist-300">{String(clampActive + 1).padStart(2, "0")}</span> /{" "}
                {String(count).padStart(2, "0")}
              </span>
              {list[clampActive]?.status === "published" ? (
                <TransitionLink
                  href={`/work/${list[clampActive].slug}`}
                  intent="work"
                  label="CASE FILE"
                  className="inline-flex items-center gap-2 text-champagne hover:text-mist-300"
                >
                  {list[clampActive].popup.ctaLabel} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </TransitionLink>
              ) : list[clampActive] ? (
                <span className="text-champagne">{list[clampActive].popup.previewLabel ?? "Case study coming soon"}</span>
              ) : null}
            </div>
          </div>
        </>
      )}

      <Lightbox project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
