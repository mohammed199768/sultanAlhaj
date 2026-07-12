import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import dynamic from "next/dynamic";

// Below-the-fold heavy client component (framer-motion, portal) — split out of the main chunk.
const StoriesViewer = dynamic(() => import("./StoriesViewer"));
import { getReelStories } from "@/lib/manifest/getPortfolio";
import home from "@/content/home.json";

export default function Reels() {
  const groups = getReelStories();
  return (
    <Section id="reels">
      <SectionHeader
        index={home.reels.index}
        eyebrow={home.reels.eyebrow}
        title={home.reels.title}
        intro={home.reels.intro}
      />
      <StoriesViewer groups={groups} />
    </Section>
  );
}
