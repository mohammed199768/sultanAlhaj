import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Images, Play, FileText } from "lucide-react";
import Container from "@/components/ui/Container";
import ImageAsset from "@/components/media/ImageAsset";
import ProjectSections from "@/components/case-studies/ProjectSections";
import TransitionLink from "@/components/transitions/TransitionLink";
import { getAllProjects, getLegacyProjectTarget, getProjectSlugs, getPublishedProjectBySlug } from "@/lib/content/projects";

export const dynamicParams = false;
export function generateStaticParams() {
  return [...getProjectSlugs(), ...getAllProjects().flatMap((project) => project.legacySlugs ?? [])].map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getPublishedProjectBySlug(params.slug) ?? getLegacyProjectTarget(params.slug);
  if (!project || project.status !== "published") return { title: "Case Study" };
  return { title: project.metadata.title ?? project.identity.title, description: project.metadata.description ?? project.summary, openGraph: project.metadata.ogImage ? { images: [project.metadata.ogImage] } : undefined };
}

export default function WorkDetail({ params }: { params: { slug: string } }) {
  const legacyTarget = getLegacyProjectTarget(params.slug);
  if (legacyTarget) redirect(`/work/${legacyTarget.slug}`);
  const project = getPublishedProjectBySlug(params.slug);
  if (!project) notFound();
  const images = project.media.filter((item) => item.kind === "image").length;
  const videos = project.media.filter((item) => item.kind === "video").length;
  const pdfs = project.media.filter((item) => item.kind === "pdf").length;
  return <article className="pt-32">
    <Container>
      <TransitionLink href="/#work" intent="back" label="WORK" className="inline-flex items-center gap-2 font-display text-[0.65rem] uppercase tracking-[0.25em] text-haze/60 transition-colors hover:text-champagne"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to work</TransitionLink>
      <div className="mt-10 grid gap-10 lg:grid-cols-12"><div className="lg:col-span-7"><p className="eyebrow">{project.category}{project.sector ? ` · ${project.sector}` : ""}</p><h1 className="display-2 mt-5 text-5xl md:text-7xl">{project.identity.title}</h1><p className="lede mt-7 max-w-2xl">{project.description}</p><div className="mt-8 flex flex-wrap gap-2">{project.services.map((service) => <span key={service} className="rounded-full border border-steel-400/25 px-3 py-1 text-[0.58rem] uppercase tracking-[0.15em] text-haze/60">{service}</span>)}</div></div>
      <div className="lg:col-span-5"><div className="rounded-2xl border border-steel-400/25 bg-surface-2/40 p-7"><p className="font-display text-[0.6rem] uppercase tracking-[0.25em] text-champagne/70">Engagement Overview</p><div className="mt-5 flex flex-wrap gap-6 text-sm text-mist"><span className="flex items-center gap-2"><Images className="h-4 w-4 text-haze/60" aria-hidden />{images} images</span><span className="flex items-center gap-2"><Play className="h-4 w-4 text-haze/60" aria-hidden />{videos} videos</span><span className="flex items-center gap-2"><FileText className="h-4 w-4 text-haze/60" aria-hidden />{pdfs} documents</span></div></div></div></div>
    </Container>
    {project.heroMedia?.kind === "image" && <Container className="mt-16"><div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-steel-400/25"><ImageAsset item={project.heroMedia} sizes="100vw" priority /></div></Container>}
    <ProjectSections project={project} />
  </article>;
}
