import type { Category } from "@/lib/manifest/types";
import { slugify } from "@/lib/utils/slugify";

/**
 * Editorial case-study shells for major clients. When a matching portfolio
 * folder exists (by `folderKey`), its media is used automatically on the
 * /work/[slug] page; otherwise a polished shell renders from this data alone.
 */
export interface CaseStudy {
  slug: string;
  client: string;
  category: Category;
  sector: string;
  summary: string;
  scope: string[];
  /** Links to a /public/portfolio folder key when media is available. */
  folderKey?: string;
  metrics?: { value: string; label: string }[];
}

function cs(input: Omit<CaseStudy, "slug">): CaseStudy {
  return { slug: slugify(input.client), ...input };
}

export const caseStudies: CaseStudy[] = [
  cs({
    client: "Quattro Village",
    category: "Events & Activations",
    sector: "Sports & Lifestyle",
    summary:
      "Marketing and branding lead for a flagship sports-and-lifestyle village — bank partnerships, Friday activations and tournament build-outs that drove footfall and awareness.",
    scope: ["Brand Operations", "Sponsorships", "Events", "Social Content"],
    metrics: [
      { value: "11+", label: "Tournament Sponsors" },
      { value: "44,796", label: "Accounts Reached" },
    ],
  }),
  cs({
    client: "Padel Me Club",
    category: "Sports",
    sector: "Sports",
    summary:
      "Full marketing scope for a premium padel club — tournaments, influencer partnerships, membership promotions and event recap films.",
    scope: ["Tournaments", "Influencers", "Video", "Memberships"],
    folderKey: "Padel Me Club",
    metrics: [{ value: "30,390", label: "Video Views" }],
  }),
  cs({
    client: "SKN Clinics",
    category: "Healthcare",
    sector: "Aesthetics & Dermatology",
    summary:
      "Always-on social and paid campaigns for an aesthetics clinic — offer creative, influencer films and consultation-driving funnels.",
    scope: ["Paid Ads", "Influencers", "Video", "Social"],
    folderKey: "SKN Clinics",
    metrics: [{ value: "266,478", label: "Paid Impressions" }],
  }),
  cs({
    client: "MCS Clinics",
    category: "Healthcare",
    sector: "Medical",
    summary:
      "Service-line campaigns and social management for a medical complex, focused on trust-building and lead generation.",
    scope: ["Strategy", "Social", "Paid Ads"],
  }),
  cs({
    client: "Avant Clinic",
    category: "Healthcare",
    sector: "Aesthetics",
    summary:
      "Aesthetic clinic campaigns spanning laser, dermatology and plastic surgery service lines.",
    scope: ["Campaigns", "Creative Direction", "Paid Ads"],
  }),
  cs({
    client: "Dr. Khurram",
    category: "Healthcare",
    sector: "Personal Medical Brand",
    summary:
      "Authority-building personal brand for a specialist — patient education content and consultation funnels.",
    scope: ["Personal Brand", "Content", "Video"],
  }),
  cs({
    client: "Tawaq",
    category: "Full Marketing Campaigns",
    sector: "Consumer",
    summary:
      "Integrated campaign concept and rollout across social and paid channels.",
    scope: ["Campaigns", "Social", "Creative"],
  }),
  cs({
    client: "Dr. Alaa Alboukai",
    category: "Healthcare",
    sector: "Personal Medical Brand",
    summary:
      "Personal medical brand content system — authority content and audience growth.",
    scope: ["Personal Brand", "Content"],
    folderKey: "Dr. Ala'a Albuqaie",
  }),
  cs({
    client: "Dr. Muhannad",
    category: "Healthcare",
    sector: "Personal Medical Brand",
    summary:
      "High-volume social content and short-form video for a doctor's personal brand.",
    scope: ["Personal Brand", "Video", "Social"],
    folderKey: "Dr. Mohannad Alharbi",
    metrics: [{ value: "+84.7%", label: "Audience Growth" }],
  }),
  cs({
    client: "Smart Gallery",
    category: "Full Branding",
    sector: "Retail",
    summary:
      "Retail brand identity and content direction with a polished, gallery-led aesthetic.",
    scope: ["Branding", "Creative Direction"],
  }),
  cs({
    client: "Albaituti",
    category: "Full Branding",
    sector: "Home & Retail",
    summary:
      "Brand-build and social system for a home-and-retail brand.",
    scope: ["Branding", "Social"],
  }),
  cs({
    client: "Passion Clinic",
    category: "Healthcare",
    sector: "Medical",
    summary:
      "Clinic marketing with offer campaigns and social presence management.",
    scope: ["Social", "Campaigns"],
  }),
  cs({
    client: "Yalla Mansaf",
    category: "F&B",
    sector: "Food & Beverage",
    summary:
      "Appetite-led F&B brand content and promotional campaigns built for a local audience.",
    scope: ["F&B", "Social", "Creative"],
  }),
  cs({
    client: "JGC Contracting",
    category: "Real Estate",
    sector: "Contracting & Real Estate",
    summary:
      "Corporate branding and project showcases for a contracting and real-estate developer.",
    scope: ["Corporate Branding", "Real Estate", "Content"],
    folderKey: "JGC Contracting",
  }),
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
