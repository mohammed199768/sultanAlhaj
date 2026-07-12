import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import home from "@/content/home.json";

export default function Tools() {
  return <Section id="tools" className="bg-surface-2/30"><SectionHeader index={home.tools.index} eyebrow={home.tools.eyebrow} title={home.tools.title} intro={home.tools.intro} /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{home.tools.groups.map((group, index) => <Reveal key={group} delay={index * 0.06}><div className="rounded-2xl border border-steel-400/25 bg-ink p-6"><p className="font-display text-[0.6rem] uppercase tracking-[0.25em] text-champagne/70">{group}</p><ul className="mt-5 space-y-3">{home.tools.items.filter((tool) => tool.group === group).map((tool) => <li key={tool.name} className="flex items-center gap-3 text-sm text-mist"><span className="h-1.5 w-1.5 rounded-full bg-bronze" />{tool.name}</li>)}</ul></div></Reveal>)}</div></Section>;
}
