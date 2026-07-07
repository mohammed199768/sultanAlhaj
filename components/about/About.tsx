import Image from "next/image";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import { profile } from "@/lib/data/profile";

const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "5", label: "Sectors Covered" },
  { value: "2", label: "Markets · JO / KSA" },
];

export default function About() {
  return (
    <Section id="about">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-steel-400/25">
              <Image
                src="/sultan.webp"
                alt={`Portrait of ${profile.name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="font-display text-lg font-semibold text-mist-300">
                  {profile.formalName}
                </p>
                <p className="text-sm text-haze/80">{profile.extendedTitle}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:pl-6">
          <Reveal>
            <span className="eyebrow">01 — About</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-2 mt-5">
              Strategy first.<br />
              <span className="text-champagne">Brands that convert.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="lede mt-8">{profile.about}</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-steel-400/25 pt-8">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 * i}>
                <div>
                  <p className="font-display text-3xl font-bold text-mist-300 md:text-5xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-haze/60">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
