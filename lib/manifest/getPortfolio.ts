import manifestJson from "./portfolio.generated.json";
import type { Manifest, MediaItem } from "./types";
import { getWorkProjectViews, getProjectBySlug, getProjectByKey, getFeaturedProjects } from "@/lib/content/projects";

const manifest = manifestJson as Manifest;
export const getProjects = getWorkProjectViews;
export { getProjectBySlug, getProjectByKey, getFeaturedProjects };
export const getWorks = (): MediaItem[] => manifest.works;
export const getReels = (): MediaItem[] => manifest.reels;
export const getClientLogos = (): MediaItem[] => manifest.clients;
export const getManifestStats = () => manifest.stats;
export const getActiveCategories = () => Array.from(new Set(getProjects().map((project) => project.category)));

export interface StoryGroup { id: string; label: string; cover: MediaItem; stories: { src: string; tag: string }[] }
const STORY_LABELS = ["Client Replies", "Campaign Love", "Community", "Shout-outs", "Results", "Kind Words"];
export function getReelStories(size = 3): StoryGroup[] {
  const groups: StoryGroup[] = [];
  for (let index = 0; index < manifest.reels.length; index += size) {
    const chunk = manifest.reels.slice(index, index + size);
    if (!chunk.length) continue;
    const label = STORY_LABELS[groups.length % STORY_LABELS.length];
    groups.push({ id: `story-${groups.length}`, label, cover: chunk[0], stories: chunk.map((item) => ({ src: item.src, tag: label })) });
  }
  return groups;
}
