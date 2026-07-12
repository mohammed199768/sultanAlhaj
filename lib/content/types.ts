import type { Category, MediaItem } from "@/lib/manifest/types";

export type ProjectStatus = "published" | "preview" | "draft";
export type ProjectSectionType = "text" | "gallery" | "metrics" | "services";

export interface ProjectMetric {
  value: string;
  label: string;
  detail?: string;
}

export interface ProjectSection {
  id: string;
  type: ProjectSectionType;
  eyebrow?: string;
  title?: string;
  body?: string[];
  items?: ProjectMetric[];
}

export interface ProjectVideoSelection {
  src: string;
  poster: string;
}

export interface ProjectDocumentSelection {
  src: string;
  title: string;
}

export interface ProjectContent {
  schemaVersion: 1;
  slug: string;
  legacySlugs?: string[];
  status: ProjectStatus;
  featured: boolean;
  order: number;
  assetFolder?: string;
  layout: "gallery";
  summary: string;
  description: string;
  identity: {
    title: string;
    shortTitle: string;
    client: string;
    category: Category;
    sector?: string;
    year?: string;
    location?: string;
  };
  card: {
    eyebrow: string;
    image: string | null;
    imageAlt: string;
  };
  popup: {
    image: string | null;
    ctaLabel: string;
    previewLabel?: string;
  };
  hero: {
    eyebrow: string;
    image: string | null;
    imageAlt: string;
  };
  metadata: { title?: string; description?: string; ogImage: string | null };
  gallery: string[];
  videos: ProjectVideoSelection[];
  documents: ProjectDocumentSelection[];
  services: string[];
  tools: string[];
  metrics: ProjectMetric[];
  sections: ProjectSection[];
  relatedProjects: string[];
}

export interface Project extends ProjectContent {
  key: string;
  client: string;
  category: Category;
  sector?: string;
  summary: string;
  tags: string[];
  cover: MediaItem | null;
  popupMedia: MediaItem | null;
  heroMedia: MediaItem | null;
  metadataMedia: MediaItem | null;
  media: MediaItem[];
  counts: { images: number; videos: number; pdfs: number };
}

export type ProjectCardData = Pick<Project, "key" | "slug" | "status" | "client" | "identity" | "category" | "summary" | "cover" | "counts" | "featured" | "order">;
export type ProjectPopupData = ProjectCardData & Pick<Project, "media" | "popup" | "popupMedia">;
export type ProjectDetailData = Project;
