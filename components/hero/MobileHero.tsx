import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import type { CSSProperties } from "react";
import { profile } from "@/lib/data/profile";
import type { MediaItem } from "@/lib/manifest/types";

const proofChips = ["Healthcare", "F&B", "Sports", "Saudi / Jordan"];

export default function MobileHero({ image }: { image: MediaItem | null }) {
  return (
    <section
      id="hero"
      className="mobile-hero relative min-h-[100dvh] overflow-hidden bg-navy-600 sm:hidden"
    >
      <div id="about" aria-hidden className="pointer-events-none absolute left-0 top-[58%] h-px w-px" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(152,170,194,0.16),transparent_48%),linear-gradient(180deg,rgba(0,4,25,0.72),rgba(7,23,57,0.96)_58%,#071739)]"
      />
      <div className="shell relative z-10 flex min-h-[100dvh] flex-col justify-center gap-4 pb-6 pt-20">
        <div className="max-w-[20rem]">
          <p
            data-mobile-hero-reveal
            className="font-display text-[0.62rem] uppercase tracking-[0.28em] text-champagne/80"
          >
            Marketing Manager
          </p>
          <h1
            data-mobile-hero-reveal
            style={{ "--mobile-hero-delay": "80ms" } as CSSProperties}
            className="mt-3 max-w-[11ch] font-display text-[2.5rem] font-extrabold uppercase leading-[0.95] tracking-normal text-mist-300"
          >
            Sultan Alhaj Ahmad
          </h1>
          <p
            data-mobile-hero-reveal
            style={{ "--mobile-hero-delay": "160ms" } as CSSProperties}
            className="mt-3 max-w-[18rem] font-display text-[0.7rem] uppercase leading-relaxed tracking-[0.16em] text-champagne-300/85"
          >
            {profile.primaryTitle}
          </p>
          <p
            data-mobile-hero-reveal
            style={{ "--mobile-hero-delay": "220ms" } as CSSProperties}
            className="mt-3 max-w-[18.5rem] text-[0.95rem] leading-relaxed text-mist/82"
          >
            5+ years across healthcare, retail, F&B, sports, and real estate.
          </p>
        </div>

        <div
          data-mobile-hero-reveal
          style={{ "--mobile-hero-delay": "280ms" } as CSSProperties}
          className="flex flex-wrap gap-2"
          aria-label="Sector experience"
        >
          {proofChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-steel-400/25 bg-mist-300/[0.04] px-3 py-1.5 font-display text-[0.56rem] uppercase tracking-[0.16em] text-haze/80"
            >
              {chip}
            </span>
          ))}
        </div>

        {image && (
          <div
            data-mobile-hero-reveal
            style={{ "--mobile-hero-delay": "340ms" } as CSSProperties}
            className="relative h-[clamp(8.25rem,23dvh,12rem)] overflow-hidden rounded-2xl border border-steel-400/25 bg-surface-2"
          >
            <Image
              src={image.src}
              alt={`${image.title} portfolio preview`}
              fill
              priority
              sizes="(max-width: 639px) 92vw, 1px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/78 via-navy-900/18 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-[0.56rem] uppercase tracking-[0.22em] text-champagne-300/85">
                  Selected Work
                </p>
                <p className="mt-1 font-display text-sm font-semibold uppercase text-mist-300">
                  Campaign Systems
                </p>
              </div>
              <ArrowDownRight className="h-5 w-5 flex-none text-champagne-300" aria-hidden />
            </div>
          </div>
        )}

        <div
          data-mobile-hero-reveal
          style={{ "--mobile-hero-delay": "420ms" } as CSSProperties}
          className="flex flex-wrap gap-3 pt-1"
        >
          <a href="#work" className="btn-primary min-h-11 px-5 text-[0.66rem]">
            View Work
          </a>
          <a href="#contact" className="btn-ghost min-h-11 px-5 text-[0.66rem]">
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
