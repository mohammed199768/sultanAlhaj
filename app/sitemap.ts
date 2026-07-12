import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/content/projects";
import site from "@/content/site.json";

const base = site.siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const work = getProjectSlugs().map((slug) => ({
    url: `${base}/work/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/cv`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...work,
  ];
}
