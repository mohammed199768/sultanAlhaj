import { ArrowUpRight } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import ImageAsset from "@/components/media/ImageAsset";
import TransitionLink from "@/components/transitions/TransitionLink";
import { caseStudies } from "@/lib/data/caseStudies";
import { getProjectBySlug } from "@/lib/manifest/getPortfolio";
import { PORTFOLIO_META } from "@/lib/data/portfolioMeta";
import type { MediaItem } from "@/lib/manifest/types";

/** Resolve a cover image for a case study from its linked folder, if any. */
function coverFor(folderKey?: string): MediaItem | null {
  if (!folderKey) return null;
  const meta = PORTFOLIO_META[folderKey];
  if (!meta) return null;
  // find by slug of the folder's client name
  const project = getProjectBySlug(
    folderKey
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
  );
  return project?.cover ?? null;
}

export default function CaseStudies() {
  return (
    <Section id="case-studies" className="bg-surface-2/30">
      <SectionHeader
        index="06"
        eyebrow="Case Studies"
        title="Selected client stories"
        intro="Deeper dives into flagship engagements across sports, healthcare, real estate and F&B. Each opens a dedicated case page."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {caseStudies.map((c, i) => {
          const cover = coverFor(c.folderKey);
          const featured = i < 2;
          return (
            <Reveal key={c.slug} delay={(i % 2) * 0.06}>
              <TransitionLink
                href={`/work/${c.slug}`}
                intent="work"
                label="CASE FILE"
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-steel-400/40 bg-mist-300 p-7 transition-colors duration-500 hover:border-champagne ${
                  featured ? "md:min-h-[22rem]" : "md:min-h-[16rem]"
                }`}
              >
                {cover && (
                  <div className="absolute inset-0 -z-0 opacity-20 transition-opacity duration-700 group-hover:opacity-30">
                    <ImageAsset item={cover} sizes="50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-mist-300 via-mist-300/85 to-mist-300/50" />
                  </div>
                )}
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="font-display text-[0.58rem] uppercase tracking-[0.25em] text-bronze-600">
                      {c.category}
                    </p>
                    <p className="mt-1 text-[0.68rem] text-steel-600">{c.sector}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-steel-600 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-bronze-600" aria-hidden />
                </div>

                <div className="relative mt-10">
                  <h3 className="font-display text-2xl font-semibold text-navy-600 md:text-3xl">
                    {c.client}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-500">
                    {c.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.scope.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-champagne-600/60 bg-champagne-300/60 px-3 py-1 text-[0.58rem] uppercase tracking-[0.15em] text-navy-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </TransitionLink>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
