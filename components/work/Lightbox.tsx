"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import ImageAsset from "@/components/media/ImageAsset";
import VideoPlayer from "@/components/media/VideoPlayer";
import PdfCard from "@/components/media/PdfCard";
import TransitionLink from "@/components/transitions/TransitionLink";
import type { Project } from "@/lib/manifest/types";

export default function Lightbox({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[80] overflow-y-auto bg-ink/95 backdrop-blur-xl"
          initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduceMotion ? 0.16 : 0.62, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.client} gallery`}
        >
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[18vw] font-extrabold uppercase leading-none text-mist/[0.025]">
              Case File
            </div>
            <div className="absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-bronze/10 blur-[120px]" />
          </div>
          <div className="shell py-24">
            <motion.div
              className="mb-10 flex items-start justify-between gap-6"
              initial={reduceMotion ? { opacity: 0 } : { y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.24, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <p className="eyebrow">{project.category}</p>
                <h3 className="display-2 mt-3 text-4xl md:text-5xl">
                  {project.client}
                </h3>
                <p className="lede mt-4 max-w-2xl">{project.summary}</p>
                {project.slug && (
                  <TransitionLink
                    href={`/work/${project.slug}`}
                    intent="work"
                    label="CASE FILE"
                    onBeforeNavigate={onClose}
                    className="mt-6 inline-flex items-center gap-2 font-display text-[0.65rem] uppercase tracking-[0.25em] text-champagne hover:text-mist-300"
                  >
                    Open full case study
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </TransitionLink>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close gallery"
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-steel-400/45 text-mist-300 transition-colors hover:border-champagne hover:text-champagne"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </motion.div>

            <motion.div
              className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4"
              initial={reduceMotion ? { opacity: 0 } : { y: 26, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.34, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            >
              {project.media.map((item) => {
                if (item.kind === "image") {
                  return (
                    <div
                      key={item.src}
                      className="overflow-hidden rounded-xl border border-steel-400/25"
                    >
                      <ImageAsset
                        item={item}
                        fill={false}
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="h-auto w-full"
                      />
                    </div>
                  );
                }
                if (item.kind === "video") {
                  return (
                    <VideoPlayer
                      key={item.src}
                      item={item}
                      className="aspect-[9/16] w-full overflow-hidden rounded-xl border border-steel-400/25"
                    />
                  );
                }
                return (
                  <PdfCard key={item.src} item={item} className="aspect-[3/4]" />
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
