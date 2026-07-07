import manifestJson from "./portfolio.generated.json";
import type { Manifest, Project, MediaItem } from "./types";
import { PORTFOLIO_META, DEFAULT_META } from "@/lib/data/portfolioMeta";

const manifest = manifestJson as Manifest;

/** All portfolio projects = manifest folders enriched with editorial metadata. */
export function getProjects(): Project[] {
  return manifest.portfolio.map((folder) => {
    const meta = PORTFOLIO_META[folder.key] ?? { ...DEFAULT_META, client: folder.key };
    return {
      key: folder.key,
      slug: folder.slug,
      client: meta.client || folder.key,
      category: meta.category,
      summary: meta.summary,
      tags: meta.tags,
      cover: folder.cover,
      media: folder.media,
      counts: { images: folder.images, videos: folder.videos, pdfs: folder.pdfs },
      featured: meta.featured,
    };
  });
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectByKey(key: string): Project | undefined {
  return getProjects().find((p) => p.key === key);
}

export function getFeaturedProjects(): Project[] {
  const projects = getProjects();
  const featured = projects.filter((p) => p.featured);
  return featured.length ? featured : projects.slice(0, 6);
}

export function getWorks(): MediaItem[] {
  return manifest.works;
}

export function getReels(): MediaItem[] {
  return manifest.reels;
}

export function getClientLogos(): MediaItem[] {
  return manifest.clients;
}

export function getManifestStats() {
  return manifest.stats;
}

/** Ordered list of categories that actually contain at least one project. */
export function getActiveCategories(): string[] {
  const set = new Set(getProjects().map((p) => p.category));
  return Array.from(set);
}

/** A group of reel screenshots presented as an Instagram-style story highlight. */
export interface StoryGroup {
  id: string;
  label: string;
  cover: MediaItem;
  stories: { src: string; tag: string }[];
}

const STORY_LABELS = [
  "Client Replies",
  "Campaign Love",
  "Community",
  "Shout-outs",
  "Results",
  "Kind Words",
];

/** Chunk reels dynamically into story highlights (no hardcoded assets). */
export function getReelStories(size = 3): StoryGroup[] {
  const reels = manifest.reels;
  const groups: StoryGroup[] = [];
  for (let i = 0; i < reels.length; i += size) {
    const chunk = reels.slice(i, i + size);
    if (!chunk.length) continue;
    const idx = groups.length;
    const label = STORY_LABELS[idx % STORY_LABELS.length];
    groups.push({
      id: `story-${idx}`,
      label,
      cover: chunk[0],
      stories: chunk.map((r) => ({ src: r.src, tag: label })),
    });
  }
  return groups;
}
