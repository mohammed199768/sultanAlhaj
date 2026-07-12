import type { ComponentType } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import ImageAsset from "@/components/media/ImageAsset";
import VideoPlayer from "@/components/media/VideoPlayer";
import PdfCard from "@/components/media/PdfCard";
import type { Project, ProjectSection, ProjectSectionType } from "@/lib/content/types";

interface SectionProps { project: Project; section: ProjectSection }

function TextSection({ section }: SectionProps) {
  if (!section.body?.length) return null;
  return <Container><section id={section.id} className="mt-16 rounded-3xl border border-steel-400/25 bg-surface-2/30 p-7 md:p-10">{section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}{section.title && <h2 className="mt-3 font-display text-2xl font-semibold text-mist-300 md:text-3xl">{section.title}</h2>}<div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-haze/75">{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section></Container>;
}

function MetricsSection({ project, section }: SectionProps) {
  const items = section.items?.length ? section.items : project.metrics;
  if (!items.length) return null;
  return <Container><section id={section.id} className="mt-16"><h2 className="font-display text-2xl font-semibold text-mist-300 md:text-3xl">{section.title ?? "Results"}</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <div key={`${item.value}-${item.label}`} className="rounded-2xl border border-steel-400/25 bg-surface-2/40 p-6"><p className="font-display text-3xl font-bold text-mist-300">{item.value}</p><p className="mt-2 text-[0.62rem] uppercase tracking-[0.15em] text-haze/60">{item.label}</p>{item.detail && <p className="mt-3 text-sm text-haze/70">{item.detail}</p>}</div>)}</div></section></Container>;
}

function ServicesSection({ project, section }: SectionProps) {
  if (!project.services.length) return null;
  return <Container><section id={section.id} className="mt-16"><h2 className="font-display text-2xl font-semibold text-mist-300 md:text-3xl">{section.title ?? "Services"}</h2><div className="mt-5 flex flex-wrap gap-2">{project.services.map((service) => <span key={service} className="rounded-full border border-steel-400/25 px-3 py-1 text-[0.58rem] uppercase tracking-[0.15em] text-haze/60">{service}</span>)}</div></section></Container>;
}

function GallerySection({ project, section }: SectionProps) {
  if (!project.media.length) return null;
  const images = project.media.filter((item) => item.kind === "image");
  const videos = project.media.filter((item) => item.kind === "video");
  const pdfs = project.media.filter((item) => item.kind === "pdf");
  return <Container><section id={section.id} className="mt-16 pb-32">{section.title && <h2 className="mb-6 font-display text-2xl font-semibold text-mist-300 md:text-3xl">{section.title}</h2>}{videos.length > 0 && <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{videos.map((item) => <VideoPlayer key={item.src} item={item} className="aspect-[9/16] w-full overflow-hidden rounded-xl border border-steel-400/25" />)}</div>}<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">{images.map((item) => <Reveal key={item.src} className="overflow-hidden rounded-xl border border-steel-400/25"><ImageAsset item={item} fill={false} sizes="(max-width: 640px) 100vw, 33vw" className="h-auto w-full" /></Reveal>)}</div>{pdfs.length > 0 && <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{pdfs.map((item) => <PdfCard key={item.src} item={item} className="aspect-[3/4]" />)}</div>}</section></Container>;
}

const sectionRegistry: Record<ProjectSectionType, ComponentType<SectionProps>> = {
  text: TextSection,
  gallery: GallerySection,
  metrics: MetricsSection,
  services: ServicesSection,
};

export default function ProjectSections({ project }: { project: Project }) {
  return <>{project.sections.map((section) => { const Component = sectionRegistry[section.type]; return <Component key={section.id} project={project} section={section} />; })}</>;
}
