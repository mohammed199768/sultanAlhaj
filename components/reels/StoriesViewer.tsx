"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { StoryGroup } from "@/lib/manifest/getPortfolio";

const STORY_DURATION = 4500;

/**
 * Instagram-style story highlights + fullscreen 9:16 viewer.
 * Adapted from new_inkspir's testimonials pattern, branded for Sultan.
 */
export default function StoriesViewer({ groups }: { groups: StoryGroup[] }) {
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [activeStory, setActiveStory] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setActiveGroup((g) => {
      if (g !== null) setSeen((s) => new Set(s).add(groups[g].id));
      return null;
    });
    setActiveStory(0);
    setPaused(false);
  }, [groups]);

  const next = useCallback(() => {
    if (activeGroup === null) return;
    const g = groups[activeGroup];
    if (activeStory < g.stories.length - 1) {
      setActiveStory((s) => s + 1);
    } else if (activeGroup < groups.length - 1) {
      setSeen((s) => new Set(s).add(g.id));
      setActiveGroup(activeGroup + 1);
      setActiveStory(0);
    } else {
      close();
    }
  }, [activeGroup, activeStory, groups, close]);

  const prev = useCallback(() => {
    if (activeStory > 0) setActiveStory((s) => s - 1);
    else if (activeGroup !== null && activeGroup > 0) {
      setActiveGroup(activeGroup - 1);
      setActiveStory(groups[activeGroup - 1].stories.length - 1);
    }
  }, [activeGroup, activeStory, groups]);

  // Autoplay
  useEffect(() => {
    if (activeGroup === null || paused) return;
    timer.current = setTimeout(next, STORY_DURATION);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [activeGroup, activeStory, paused, next]);

  // Keyboard + scroll lock
  useEffect(() => {
    if (activeGroup === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeGroup, close, next, prev]);

  if (!groups.length) {
    return (
      <div className="rounded-3xl border border-dashed border-steel-400/35 py-20 text-center text-sm text-haze/50">
        Testimonials coming soon.
      </div>
    );
  }

  return (
    <>
      {/* Highlights row */}
      <div className="no-scrollbar -mx-[var(--shell-x)] flex gap-6 overflow-x-auto px-[var(--shell-x)] pb-4 md:mx-0 md:justify-start md:px-0">
        {groups.map((group, idx) => {
          const isSeen = seen.has(group.id);
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                setActiveGroup(idx);
                setActiveStory(0);
              }}
              className="group flex flex-none flex-col items-center gap-3"
              aria-label={`Open ${group.label} stories`}
            >
              <span
                className={`rounded-full p-[3px] transition-transform duration-500 group-hover:scale-105 ${
                  isSeen ? "bg-mist/15" : "bg-gradient-to-tr from-bronze via-champagne to-bronze"
                }`}
              >
                <span className="block rounded-full bg-ink p-[3px]">
                  <span className="relative block h-20 w-20 overflow-hidden rounded-full md:h-28 md:w-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={group.cover.src}
                      alt={group.label}
                      className={`h-full w-full object-cover transition-all duration-500 ${
                        isSeen ? "opacity-60" : "opacity-100"
                      }`}
                    />
                  </span>
                </span>
              </span>
              <span
                className={`font-display text-[0.68rem] uppercase tracking-[0.15em] transition-colors ${
                  isSeen ? "text-haze/40" : "text-mist group-hover:text-mist-300"
                }`}
              >
                {group.label}
              </span>
            </button>
          );
        })}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeGroup !== null && (
              <motion.div
                className="fixed inset-0 z-[999999] flex items-center justify-center bg-ink/95 backdrop-blur-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
                role="dialog"
                aria-modal="true"
                aria-label={`${groups[activeGroup].label} stories`}
              >
                <motion.div
                  key={activeGroup}
                  initial={{ scale: 0.95, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 40 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={() => setPaused(true)}
                  onMouseUp={() => setPaused(false)}
                  onMouseLeave={() => setPaused(false)}
                  onTouchStart={() => setPaused(true)}
                  onTouchEnd={() => setPaused(false)}
                  className="relative h-[100dvh] w-full overflow-hidden bg-navy-900 shadow-[0_40px_100px_rgba(0,0,0,0.9)] md:h-[90vh] md:max-h-[900px] md:w-[440px] md:rounded-[2.5rem] md:border md:border-navy-500"
                >
                  {/* Media */}
                  <motion.img
                    key={`${activeGroup}-${activeStory}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={groups[activeGroup].stories[activeStory].src}
                    alt="Testimonial"
                    className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-navy-900/50" />

                  {/* Top overlay */}
                  <div className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-navy-900/80 to-transparent p-4 pb-10 pt-8">
                    <div className="mb-4 flex gap-1.5">
                      {groups[activeGroup].stories.map((_, i) => (
                        <div
                          key={i}
                          className="h-[3px] flex-1 overflow-hidden rounded-full bg-mist/20"
                        >
                          <div
                            className={`h-full bg-champagne shadow-[0_0_8px_rgba(227,195,157,0.5)] ${
                              i < activeStory
                                ? "w-full"
                                : i > activeStory
                                  ? "w-0"
                                  : "w-0 animate-[storybar_4.5s_linear_forwards]"
                            }`}
                            style={
                              i === activeStory && paused
                                ? { animationPlayState: "paused" }
                                : undefined
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-gradient-to-tr from-bronze to-champagne p-[2px]">
                          <span className="block h-9 w-9 overflow-hidden rounded-full border border-navy-900/20 md:h-10 md:w-10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={groups[activeGroup].cover.src}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </span>
                        </span>
                        <div>
                          <p className="font-display text-sm font-semibold leading-tight text-mist-300">
                            Sultan Shadi
                          </p>
                          <p className="text-[11px] text-mist/70">
                            {groups[activeGroup].label}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          close();
                        }}
                        aria-label="Close stories"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-steel-400/25 bg-mist/10 backdrop-blur transition-colors hover:bg-mist/20"
                      >
                        <X className="h-5 w-5 text-mist-300" aria-hidden />
                      </button>
                    </div>
                  </div>

                  {/* Tap zones */}
                  <div className="absolute inset-0 z-30 flex">
                    <button
                      type="button"
                      aria-label="Previous"
                      className="h-full w-[35%] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        prev();
                      }}
                    />
                    <div className="flex-1" />
                    <button
                      type="button"
                      aria-label="Next"
                      className="h-full w-[35%] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        next();
                      }}
                    />
                  </div>

                  {/* Tag pill */}
                  <div className="absolute inset-x-0 bottom-[env(safe-area-inset-bottom,28px)] z-40 flex justify-center px-4">
                    <motion.span
                      key={`tag-${activeGroup}-${activeStory}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-full border border-steel-400/25 bg-navy-900/60 px-6 py-2.5 font-display text-[0.62rem] uppercase tracking-[0.25em] text-mist-300 backdrop-blur-lg"
                    >
                      {groups[activeGroup].stories[activeStory].tag}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Desktop arrows */}
                <div className="pointer-events-none absolute inset-0 hidden items-center justify-between px-16 lg:flex">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prev();
                    }}
                    aria-label="Previous"
                    className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-steel-400/45 bg-mist/5 text-mist-300 backdrop-blur transition-colors hover:bg-mist/10"
                  >
                    <ChevronLeft className="h-7 w-7" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      next();
                    }}
                    aria-label="Next"
                    className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-steel-400/45 bg-mist/5 text-mist-300 backdrop-blur transition-colors hover:bg-mist/10"
                  >
                    <ChevronRight className="h-7 w-7" aria-hidden />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
