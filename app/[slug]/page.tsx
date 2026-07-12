import { notFound, redirect } from "next/navigation";
import { getAllProjects, getLegacyProjectTarget, getProjectSlugs } from "@/lib/content/projects";

export const dynamicParams = false;
export function generateStaticParams() {
  return [...getProjectSlugs(), ...getAllProjects().flatMap((project) => project.legacySlugs ?? [])].map((slug) => ({ slug }));
}

export default function RootWorkRedirect({ params }: { params: { slug: string } }) {
  const legacy = getLegacyProjectTarget(params.slug);
  if (legacy) redirect(`/work/${legacy.slug}`);
  if (!getProjectSlugs().includes(params.slug)) notFound();
  redirect(`/work/${params.slug}`);
}
