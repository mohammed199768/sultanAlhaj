import { caseStudies } from "@/lib/data/caseStudies";
import {
  getProjects,
  getProjectBySlug,
  getProjectByKey,
} from "@/lib/manifest/getPortfolio";
import type { MediaItem, Category } from "@/lib/manifest/types";

export interface WorkView {
  slug: string;
  client: string;
  category: Category | string;
  sector?: string;
  summary: string;
  scope: string[];
  metrics: { value: string; label: string }[];
  media: MediaItem[];
  cover: MediaItem | null;
  hasMedia: boolean;
}

/** Every slug we render a page for = case studies ∪ portfolio projects. */
export function getAllWorkSlugs(): string[] {
  const set = new Set<string>();
  caseStudies.forEach((c) => set.add(c.slug));
  getProjects().forEach((p) => set.add(p.slug));
  return Array.from(set);
}

export function resolveWork(slug: string): WorkView | null {
  const cs = caseStudies.find((c) => c.slug === slug);
  if (cs) {
    const project = cs.folderKey ? getProjectByKey(cs.folderKey) : undefined;
    return {
      slug: cs.slug,
      client: cs.client,
      category: cs.category,
      sector: cs.sector,
      summary: cs.summary,
      scope: cs.scope,
      metrics: cs.metrics ?? [],
      media: project?.media ?? [],
      cover: project?.cover ?? null,
      hasMedia: Boolean(project?.media.length),
    };
  }

  const project = getProjectBySlug(slug);
  if (project) {
    return {
      slug: project.slug,
      client: project.client,
      category: project.category,
      summary: project.summary,
      scope: project.tags,
      metrics: [],
      media: project.media,
      cover: project.cover,
      hasMedia: project.media.length > 0,
    };
  }

  return null;
}
