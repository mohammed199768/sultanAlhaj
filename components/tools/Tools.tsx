import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { tools } from "@/lib/data/tools";

const groups = ["Advertising", "Analytics", "Creative", "Platform"] as const;

export default function Tools() {
  return (
    <Section id="tools" className="bg-surface-2/30">
      <SectionHeader
        index="09"
        eyebrow="Tools & Platforms"
        title="The command center"
        intro="The advertising, analytics and creative stack behind every campaign."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {groups.map((g, gi) => (
          <Reveal key={g} delay={gi * 0.06}>
            <div className="rounded-2xl border border-steel-400/25 bg-ink p-6">
              <p className="font-display text-[0.6rem] uppercase tracking-[0.25em] text-champagne/70">
                {g}
              </p>
              <ul className="mt-5 space-y-3">
                {tools
                  .filter((t) => t.group === g)
                  .map((t) => (
                    <li
                      key={t.name}
                      className="flex items-center gap-3 text-sm text-mist"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-bronze" />
                      {t.name}
                    </li>
                  ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
