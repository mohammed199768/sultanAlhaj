import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import CapabilitiesFlow from "./CapabilitiesFlow";

export default function Capabilities() {
  return (
    <Section id="capabilities" className="bg-surface-2/30">
      <SectionHeader
        index="03"
        eyebrow="Capabilities"
        title="A full-stack marketing skill set"
        intro="From research and strategy to creative production, paid performance and on-ground activation — everything a brand needs under one roof."
      />
      <Reveal>
        <CapabilitiesFlow />
      </Reveal>
    </Section>
  );
}
