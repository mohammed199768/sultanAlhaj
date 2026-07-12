import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import dynamic from "next/dynamic";

// Below-the-fold heavy client component (framer-motion) — split out of the main chunk.
const WorkCoverflow = dynamic(() => import("./WorkCoverflow"));
import { getProjects, getActiveCategories } from "@/lib/manifest/getPortfolio";
import home from "@/content/home.json";

export default function SelectedWork() {
  const projects = getProjects();
  const categories = getActiveCategories();

  return (
    <Section id="work" full className="overflow-hidden">
      <div className="shell">
        <SectionHeader
          index={home.work.index}
          eyebrow={home.work.eyebrow}
          title={home.work.title}
          intro={home.work.intro}
        />
      </div>
      <div className="shell">
        <WorkCoverflow projects={projects} categories={categories} />
      </div>
    </Section>
  );
}
