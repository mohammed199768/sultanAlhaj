import CinematicOpening from "@/components/hero/CinematicOpening";
import Capabilities from "@/components/capabilities/Capabilities";
import ExperienceTimeline from "@/components/experience/ExperienceTimeline";
import SelectedWork from "@/components/work/SelectedWork";
import Clients from "@/components/clients/Clients";
import CaseStudies from "@/components/case-studies/CaseStudies";
import Results from "@/components/results/Results";
import Reels from "@/components/reels/Reels";
import Tools from "@/components/tools/Tools";
import Contact from "@/components/contact/Contact";
import { getWorks } from "@/lib/manifest/getPortfolio";
import SectionBoundary from "@/components/transitions/SectionBoundary";

export default function HomePage() {
  const previews = getWorks();
  return (
    <>
      {/* Unified cinematic chapter replaces Hero + hero-about boundary + About.
          The phase handoff inside the chapter is the transition between the
          first two content beats; other boundaries below are untouched. */}
      <CinematicOpening previews={previews} />
      <Capabilities />
      <ExperienceTimeline />
      <SectionBoundary name="experience-work" />
      <SelectedWork />
      <SectionBoundary name="work-clients" />
      <Clients />
      <CaseStudies />
      <Results />
      <SectionBoundary name="results-reels" />
      <Reels />
      <Tools />
      <SectionBoundary name="tools-contact" />
      <Contact />
    </>
  );
}
