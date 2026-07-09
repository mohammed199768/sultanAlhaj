"use client";

import { motion } from "framer-motion";
import { Play, FileText, Images } from "lucide-react";
import ImageAsset from "@/components/media/ImageAsset";
import type { Project } from "@/lib/manifest/types";

export default function WorkCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (p: Project) => void;
}) {
  const { cover, counts } = project;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Open ${project.client} gallery`}
        className="relative block w-full overflow-hidden rounded-2xl border border-steel-400/25 text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
          {cover && cover.kind === "image" ? (
            <ImageAsset
              item={cover}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="pointer-events-none select-none transition-transform duration-700 ease-cinema group-hover:scale-105"
            />
          ) : cover && cover.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.poster}
              alt={project.client}
              className="pointer-events-none h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="pointer-events-none flex h-full items-center justify-center bg-gradient-to-br from-surface-2 to-ink">
              <span className="font-display text-xs uppercase tracking-[0.3em] text-haze/50">
                {project.client}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-80" />

          {/* Media type chips */}
          <div className="pointer-events-none absolute right-3 top-3 flex gap-1.5">
            {counts.videos > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[0.55rem] text-mist backdrop-blur">
                <Play className="h-2.5 w-2.5" aria-hidden /> {counts.videos}
              </span>
            )}
            {counts.pdfs > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[0.55rem] text-mist backdrop-blur">
                <FileText className="h-2.5 w-2.5" aria-hidden /> {counts.pdfs}
              </span>
            )}
            {counts.images > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[0.55rem] text-mist backdrop-blur">
                <Images className="h-2.5 w-2.5" aria-hidden /> {counts.images}
              </span>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
          <p className="font-display text-[0.6rem] uppercase tracking-[0.25em] text-champagne/80">
            {project.category}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-mist-300">
            {project.client}
          </h3>
        </div>
      </button>
    </motion.article>
  );
}
