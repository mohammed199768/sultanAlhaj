import type { MetadataRoute } from "next";
import { getAllWorkSlugs } from "@/lib/data/resolveWork";

const base = "https://sultanshadi.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const work = getAllWorkSlugs().map((slug) => ({
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
