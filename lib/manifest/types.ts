export type MediaKind = "image" | "video" | "pdf";

export interface MediaItem {
  kind: MediaKind;
  src: string;
  title: string;
  fileName: string;
  poster?: string;
  width?: number;
  height?: number;
  unsupportedVideo?: boolean;
}

export interface PortfolioFolder {
  key: string;
  slug: string;
  images: number;
  videos: number;
  pdfs: number;
  cover: MediaItem | null;
  media: MediaItem[];
}

export interface Manifest {
  generatedAt: string;
  portfolio: PortfolioFolder[];
  works: MediaItem[];
  reels: MediaItem[];
  clients: MediaItem[];
  stats: {
    folders: number;
    images: number;
    videos: number;
    pdfs: number;
    unsupportedVideos: number;
  };
}

/** Categories used across the portfolio + filters. */
export const CATEGORIES = [
  "Social Media",
  "Full Branding",
  "Full Marketing Campaigns",
  "Healthcare",
  "F&B",
  "Sports",
  "Real Estate",
  "Events & Activations",
  "Motion & Video",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** A portfolio project = manifest folder + editorial metadata. */
export type { Project } from "@/lib/content/types";
