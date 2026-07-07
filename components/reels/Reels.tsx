import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import dynamic from "next/dynamic";

// Below-the-fold heavy client component (framer-motion, portal) — split out of the main chunk.
const StoriesViewer = dynamic(() => import("./StoriesViewer"));
import { getReelStories } from "@/lib/manifest/getPortfolio";

export default function Reels() {
  const groups = getReelStories();
  return (
    <Section id="reels">
      <SectionHeader
        index="08"
        eyebrow="Testimonials"
        title="Words from clients & community"
        intro="Real replies and reactions from the campaigns and communities built along the way. Tap a highlight to watch the story."
      />
      <StoriesViewer groups={groups} />
    </Section>
  );
}
