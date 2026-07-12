import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import CapabilitiesFlow from "./CapabilitiesFlow";
import home from "@/content/home.json";

export default function Capabilities() {
  return <Section id="capabilities" className="bg-surface-2/30"><SectionHeader index={home.capabilities.index} eyebrow={home.capabilities.eyebrow} title={home.capabilities.title} intro={home.capabilities.intro} /><Reveal><CapabilitiesFlow /></Reveal></Section>;
}
