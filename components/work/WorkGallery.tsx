"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import WorkFilters from "./WorkFilters";
import WorkCard from "./WorkCard";
import Lightbox from "./Lightbox";
import type { ProjectPopupData } from "@/lib/content/types";

export default function WorkGallery({
  projects,
  categories,
}: {
  projects: ProjectPopupData[];
  categories: string[];
}) {
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState<ProjectPopupData | null>(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? projects
        : projects.filter((p) => p.category === active),
    [active, projects]
  );

  return (
    <div>
      <WorkFilters categories={categories} active={active} onChange={setActive} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-steel-400/35 py-24 text-center">
          <p className="font-display text-sm uppercase tracking-[0.25em] text-haze/60">
            No projects in this category yet
          </p>
          <button
            type="button"
            onClick={() => setActive("All")}
            className="mt-4 text-xs text-champagne underline underline-offset-4"
          >
            View all work
          </button>
        </div>
      ) : (
        <LayoutGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <WorkCard key={p.key} project={p} onOpen={setSelected} />
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      )}

      <Lightbox project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
