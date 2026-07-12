import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import manifestJson from "@/lib/manifest/portfolio.generated.json";
import type { Manifest, MediaItem } from "@/lib/manifest/types";
import type { Project, ProjectContent } from "./types";
import { validateProjects } from "./validate";

const manifest = manifestJson as Manifest;
let cache: Project[] | undefined;
const mediaBySrc = new Map(
  [
    ...manifest.portfolio.flatMap((folder) => folder.media),
    ...manifest.works,
    ...manifest.reels,
    ...manifest.clients,
  ].map((item) => [item.src, item])
);

function readProjectContent(): ProjectContent[] {
  const directory = path.join(process.cwd(), "content", "projects");
  const files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
  const values: unknown[] = files.map((file) => JSON.parse(readFileSync(path.join(directory, file), "utf8")));
  validateProjects(values, new Set(manifest.portfolio.map((folder) => folder.key)));
  return values;
}

function selectedMedia(src: string | null, title?: string): MediaItem | null {
  if (!src) return null;
  const item = mediaBySrc.get(src);
  if (!item) throw new Error(`Selected media is missing from the generated manifest: ${src}`);
  return title ? { ...item, title } : item;
}

function selectedKind(src: string, kind: MediaItem["kind"], title?: string): MediaItem {
  const item = selectedMedia(src, title);
  if (!item || item.kind !== kind) throw new Error(`Selected ${kind} has an incompatible media type: ${src}`);
  return item;
}

export function getAllProjects(): Project[] {
  if (cache) return cache;
  cache = readProjectContent().map((content) => {
    const cover = selectedMedia(content.card.image, content.card.imageAlt);
    const popupMedia = selectedMedia(content.popup.image, `${content.identity.title} popup`);
    const heroMedia = selectedMedia(content.hero.image, content.hero.imageAlt);
    const metadataMedia = selectedMedia(content.metadata.ogImage, `${content.identity.title} social preview`);
    const gallery = content.gallery.map((src) => selectedKind(src, "image"));
    const videos = content.videos.map(({ src, poster }) => ({
      ...selectedKind(src, "video"),
      poster,
      unsupportedVideo: false,
    }));
    const documents = content.documents.map(({ src, title }) => selectedKind(src, "pdf", title));
    const media = [...gallery, ...videos, ...documents];
    return {
      ...content,
      key: content.assetFolder ?? content.slug,
      client: content.identity.client,
      category: content.identity.category,
      sector: content.identity.sector,
      summary: content.summary,
      tags: content.services,
      cover,
      popupMedia,
      heroMedia,
      metadataMedia,
      media,
      counts: {
        images: media.filter((item) => item.kind === "image").length,
        videos: media.filter((item) => item.kind === "video").length,
        pdfs: media.filter((item) => item.kind === "pdf").length,
      },
    };
  }).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return cache;
}

export const getPublishedProjects = () => getAllProjects().filter((project) => project.status === "published");
export const getVisibleProjects = () => getAllProjects().filter((project) => project.status !== "draft");
export const getWorkProjects = () => getVisibleProjects().filter((project) => Boolean(project.assetFolder || project.featured));
export const getWorkProjectViews = () => getWorkProjects().map(({ key, slug, status, client, identity, category, summary, cover, counts, featured, order, media, popup, popupMedia }) => ({ key, slug, status, client, identity, category, summary, cover, counts, featured, order, media, popup, popupMedia }));
export const getFeaturedProjects = () => getVisibleProjects().filter((project) => project.featured);
export const getProjectBySlug = (slug: string) => getAllProjects().find((project) => project.slug === slug);
export const getProjectByKey = (key: string) => getAllProjects().find((project) => project.key === key);
export const getPublishedProjectBySlug = (slug: string) => getPublishedProjects().find((project) => project.slug === slug);
export const getProjectSlugs = () => getPublishedProjects().map((project) => project.slug);
export const getLegacyProjectTarget = (slug: string) => getAllProjects().find((project) => project.legacySlugs?.includes(slug));
export const getRelatedProjects = (project: Project) => project.relatedProjects.map(getProjectBySlug).filter((item): item is Project => Boolean(item && item.status !== "draft"));
