import { MapPin } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { experience } from "@/lib/data/experience";
import home from "@/content/home.json";

export default function ExperienceTimeline() {
  return (
    <Section id="experience">
      <SectionHeader
        index={home.experience.index}
        eyebrow={home.experience.eyebrow}
        title={home.experience.title}
        intro={home.experience.intro}
      />

      <div className="relative">
        {/* Vertical spine */}
        <div className="absolute left-0 top-0 hidden h-full w-px bg-gradient-to-b from-champagne/40 via-mist/10 to-transparent md:left-[14rem] md:block" />

        <div className="flex flex-col gap-16">
          {experience.map((role) => (
            <Reveal key={role.company}>
              <article className="grid gap-6 md:grid-cols-[13rem_1fr] md:gap-12">
                <div className="md:pt-1">
                  <div className="flex items-center gap-2">
                    {role.current && (
                      <span className="flex h-2 w-2">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-champagne/60" />
                        <span className="inline-flex h-2 w-2 rounded-full bg-champagne" />
                      </span>
                    )}
                    <span className="font-display text-[0.65rem] uppercase tracking-[0.2em] text-champagne">
                      {role.current ? home.experience.currentLabel : home.experience.pastLabel}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-sm text-mist">{role.period}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-haze/60">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {role.location}
                  </p>
                </div>

                <div className="relative md:pl-12">
                  <span className="absolute -left-[3.15rem] top-2 hidden h-3 w-3 rounded-full border-2 border-champagne bg-ink md:block" />
                  <h3 className="font-display text-xl font-semibold text-mist-300 md:text-2xl">
                    {role.role}
                  </h3>
                  <p className="mt-1 text-sm text-champagne/80">{role.company}</p>
                  <ul className="mt-5 space-y-2.5">
                    {role.points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-3 text-sm leading-relaxed text-haze/75"
                      >
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-bronze" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
