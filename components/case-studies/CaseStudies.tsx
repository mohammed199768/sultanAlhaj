import { ArrowUpRight } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import ImageAsset from "@/components/media/ImageAsset";
import TransitionLink from "@/components/transitions/TransitionLink";
import { getProjectBySlug } from "@/lib/content/projects";
import home from "@/content/home.json";

export default function CaseStudies() {
  const projects = home.caseStudies.projectSlugs.map(getProjectBySlug).filter(Boolean);
  return (
    <Section id="case-studies" className="bg-surface-2/30">
      <SectionHeader index={home.caseStudies.index} eyebrow={home.caseStudies.eyebrow} title={home.caseStudies.title} intro={home.caseStudies.intro} />
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project, index) => {
          if (!project) return null;
          const featured = index < 2;
          const body = <>
            {project.cover && <div className="absolute inset-0 -z-0 opacity-20 transition-opacity duration-700 group-hover:opacity-30"><ImageAsset item={project.cover} sizes="50vw" /><div className="absolute inset-0 bg-gradient-to-t from-mist-300 via-mist-300/85 to-mist-300/50" /></div>}
            <div className="relative flex items-start justify-between"><div><p className="font-display text-[0.58rem] uppercase tracking-[0.25em] text-bronze-600">{project.category}</p>{project.sector && <p className="mt-1 text-[0.68rem] text-steel-600">{project.sector}</p>}</div>{project.status === "published" ? <ArrowUpRight className="h-5 w-5 text-steel-600 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-bronze-600" aria-hidden /> : <span className="rounded-full border border-bronze-600/30 px-3 py-1 text-[0.52rem] uppercase tracking-[0.12em] text-bronze-600">{project.popup.previewLabel}</span>}</div>
            <div className="relative mt-10"><h3 className="font-display text-2xl font-semibold text-navy-600 md:text-3xl">{project.identity.title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-navy-500">{project.summary}</p><div className="mt-5 flex flex-wrap gap-2">{project.services.map((service) => <span key={service} className="rounded-full border border-champagne-600/60 bg-champagne-300/60 px-3 py-1 text-[0.58rem] uppercase tracking-[0.15em] text-navy-600">{service}</span>)}</div></div>
          </>;
          const className = `group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-steel-400/40 bg-mist-300 p-7 transition-colors duration-500 ${project.status === "published" ? "hover:border-champagne" : "cursor-default"} ${featured ? "md:min-h-[22rem]" : "md:min-h-[16rem]"}`;
          return <Reveal key={project.slug} delay={(index % 2) * 0.06}>{project.status === "published" ? <TransitionLink href={`/work/${project.slug}`} intent="work" label="CASE FILE" className={className}>{body}</TransitionLink> : <article className={className}>{body}</article>}</Reveal>;
        })}
      </div>
    </Section>
  );
}
