import type { Category } from "@/lib/manifest/types";

/**
 * CENTRALIZED, EDITABLE MAPPING.
 * Maps each raw folder key in /public/portfolio to a display client name,
 * category, short summary and tags. Inferred from folder names + asset content.
 * Correct any entry here — nothing else needs to change.
 */
export interface FolderMeta {
  client: string;
  category: Category;
  summary: string;
  tags: string[];
  featured?: boolean;
}

export const DEFAULT_META: FolderMeta = {
  client: "",
  category: "Social Media",
  summary:
    "Brand content, campaign creative and social storytelling produced end to end.",
  tags: ["Social Media", "Content"],
};

export const PORTFOLIO_META: Record<string, FolderMeta> = {
  "Padel Me Club": {
    client: "Padel Me Club",
    category: "Sports",
    summary:
      "Sports brand and community activation for a padel club — tournaments, membership drives and event recap films.",
    tags: ["Sports", "Events", "Video", "Branding"],
    featured: true,
  },
  "SKN Clinics": {
    client: "SKN Clinics",
    category: "Healthcare",
    summary:
      "Aesthetic and dermatology clinic marketing — offer campaigns, influencer films and always-on social presence.",
    tags: ["Healthcare", "Paid Ads", "Video"],
    featured: true,
  },
  Curevie: {
    client: "Curevie",
    category: "Healthcare",
    summary:
      "Healthcare brand social presence — educational content and treatment-led campaign creative.",
    tags: ["Healthcare", "Social Media"],
  },
  "Dr. Ala'a Albuqaie": {
    client: "Dr. Ala'a Albuqaie",
    category: "Healthcare",
    summary:
      "Personal medical brand for a specialist doctor — authority-building content and consultation funnels.",
    tags: ["Healthcare", "Personal Brand"],
  },
  "Dr. Mohannad Alharbi": {
    client: "Dr. Mohannad Alharbi",
    category: "Healthcare",
    summary:
      "Doctor personal brand — high-volume social content, patient education and short-form video.",
    tags: ["Healthcare", "Personal Brand", "Video"],
    featured: true,
  },
  HAMC: {
    client: "HAMC",
    category: "Healthcare",
    summary:
      "Medical complex marketing — service-line campaigns, promotional films and social management.",
    tags: ["Healthcare", "Campaigns", "Video"],
  },
  Harmony: {
    client: "Harmony",
    category: "Full Branding",
    summary:
      "Full brand build and social system — identity, content templates and launch campaign.",
    tags: ["Branding", "Social Media"],
  },
  Horvath: {
    client: "Horvath",
    category: "Full Branding",
    summary:
      "Brand identity and content direction — a refined visual system and editorial social feed.",
    tags: ["Branding", "Content Direction"],
  },
  "JGC Contracting": {
    client: "JGC Contracting",
    category: "Real Estate",
    summary:
      "Contracting and real-estate developer marketing — corporate branding and project showcases.",
    tags: ["Real Estate", "Corporate", "Branding"],
    featured: true,
  },
  "Manal Alhihi": {
    client: "Manal Alhihi",
    category: "Social Media",
    summary:
      "Personal brand social growth — content strategy, carousels and audience-building creative.",
    tags: ["Personal Brand", "Social Media"],
  },
  Branding: {
    client: "Brand Profiles & Catalogues",
    category: "Full Branding",
    summary:
      "Company profiles, catalogues and brand collateral designed as print-ready PDF systems.",
    tags: ["Branding", "Print", "Collateral"],
    featured: true,
  },
  digital: {
    client: "Motion Reel",
    category: "Motion & Video",
    summary:
      "A reel of motion graphics and short-form video edits produced across client campaigns.",
    tags: ["Motion Graphics", "Video"],
  },
  disasev: {
    client: "Disasev",
    category: "Social Media",
    summary:
      "Social-first brand content — campaign creative and a cohesive grid system.",
    tags: ["Social Media", "Content"],
  },
  ibtsm: {
    client: "Ibtsm",
    category: "Full Marketing Campaigns",
    summary:
      "Integrated campaign — creative content, short-form video and multi-platform rollout at scale.",
    tags: ["Campaigns", "Video", "Social Media"],
    featured: true,
  },
  kulib: {
    client: "Kulib",
    category: "F&B",
    summary:
      "Food & beverage brand social — appetite-led photography direction and promotional creative.",
    tags: ["F&B", "Social Media"],
  },
  mada: {
    client: "Mada",
    category: "Full Marketing Campaigns",
    summary:
      "Campaign content system — creative concepts and a consistent multi-post rollout.",
    tags: ["Campaigns", "Social Media"],
  },
  nemo: {
    client: "Nemo",
    category: "Social Media",
    summary:
      "Brand social content — playful campaign creative and an editorial content calendar.",
    tags: ["Social Media", "Content"],
  },
  yula: {
    client: "Yula",
    category: "F&B",
    summary:
      "F&B brand content — menu-led creative, launch promotions and social storytelling.",
    tags: ["F&B", "Social Media"],
  },
  ziena: {
    client: "Ziena",
    category: "Full Branding",
    summary:
      "Brand identity and content direction — a warm, considered visual world across social.",
    tags: ["Branding", "Social Media"],
  },
};
