import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Images, Play, FileText } from "lucide-react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import ImageAsset from "@/components/media/ImageAsset";
import VideoPlayer from "@/components/media/VideoPlayer";
import PdfCard from "@/components/media/PdfCard";
import TransitionLink from "@/components/transitions/TransitionLink";
import { getAllWorkSlugs, resolveWork } from "@/lib/data/resolveWork";

export function generateStaticParams() {
  return getAllWorkSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const work = resolveWork(params.slug);
  if (!work) return { title: "Case Study" };
  return {
    title: work.client,
    description: work.summary,
  };
}

export default function WorkDetail({ params }: { params: { slug: string } }) {
  const work = resolveWork(params.slug);
  if (!work) notFound();

  const images = work.media.filter((m) => m.kind === "image");
  const videos = work.media.filter((m) => m.kind === "video");
  const pdfs = work.media.filter((m) => m.kind === "pdf");

  return (
    <article className="pt-32">
      {/* Hero */}
      <Container>
        <TransitionLink
          href="/#work"
          intent="back"
          label="WORK"
          className="inline-flex items-center gap-2 font-display text-[0.65rem] uppercase tracking-[0.25em] text-haze/60 transition-colors hover:text-champagne"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to work
        </TransitionLink>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">
              {work.category}
              {work.sector ? ` · ${work.sector}` : ""}
            </p>
            <h1 className="display-2 mt-5 text-5xl md:text-7xl">{work.client}</h1>
            <p className="lede mt-7 max-w-2xl">{work.summary}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {work.scope.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-steel-400/25 px-3 py-1 text-[0.58rem] uppercase tracking-[0.15em] text-haze/60"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Media summary / metrics */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-steel-400/25 bg-surface-2/40 p-7">
              <p className="font-display text-[0.6rem] uppercase tracking-[0.25em] text-champagne/70">
                Engagement Overview
              </p>
              <div className="mt-5 flex flex-wrap gap-6 text-sm text-mist">
                <span className="flex items-center gap-2">
                  <Images className="h-4 w-4 text-haze/60" aria-hidden />
                  {images.length} images
                </span>
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-haze/60" aria-hidden />
                  {videos.length} videos
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-haze/60" aria-hidden />
                  {pdfs.length} documents
                </span>
              </div>

              {work.metrics.length > 0 && (
                <div className="mt-7 grid grid-cols-2 gap-4 border-t border-steel-400/25 pt-6">
                  {work.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="font-display text-2xl font-bold text-mist-300">
                        {m.value}
                      </p>
                      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.15em] text-haze/60">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Cover */}
      {work.cover && work.cover.kind === "image" && (
        <Container className="mt-16">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-steel-400/25">
            <ImageAsset item={work.cover} sizes="100vw" priority />
          </div>
        </Container>
      )}

      {/* Gallery */}
      <Container className="mt-16 pb-32">
        {work.hasMedia ? (
          <>
            {videos.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {videos.map((item) => (
                  <VideoPlayer
                    key={item.src}
                    item={item}
                    className="aspect-[9/16] w-full overflow-hidden rounded-xl border border-steel-400/25"
                  />
                ))}
              </div>
            )}

            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
              {images.map((item) => (
                <Reveal
                  key={item.src}
                  className="overflow-hidden rounded-xl border border-steel-400/25"
                >
                  <ImageAsset
                    item={item}
                    fill={false}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="h-auto w-full"
                  />
                </Reveal>
              ))}
            </div>

            {pdfs.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pdfs.map((item) => (
                  <PdfCard key={item.src} item={item} className="aspect-[3/4]" />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-steel-400/35 px-8 py-24 text-center">
            <p className="font-display text-sm uppercase tracking-[0.25em] text-champagne/70">
              Case study in production
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-haze/60">
              Full visuals and campaign breakdown for {work.client} are being
              prepared. In the meantime, explore the live work archive.
            </p>
            <TransitionLink
              href="/#work"
              intent="back"
              label="WORK"
              className="mt-8 inline-block text-xs text-champagne underline underline-offset-4"
            >
              Browse selected work
            </TransitionLink>
          </div>
        )}
      </Container>
    </article>
  );
}
