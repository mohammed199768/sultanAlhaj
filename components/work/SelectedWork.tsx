import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import dynamic from "next/dynamic";

// Below-the-fold heavy client component (framer-motion) — split out of the main chunk.
const WorkCoverflow = dynamic(() => import("./WorkCoverflow"));
import { getProjects, getActiveCategories } from "@/lib/manifest/getPortfolio";

export default function SelectedWork() {
  const projects = getProjects();
  const categories = getActiveCategories();

  return (
    <Section id="work" full className="overflow-hidden">
      <div className="shell">
        <SectionHeader
          index="05"
          eyebrow="Selected Work"
          title="A living archive of brands & campaigns"
          intro="A curated, filterable archive built dynamically from real client work — images, films and brand documents. Swipe, drag or let it play; tap the focused project to open its gallery."
        />
      </div>
      <div className="shell">
        <WorkCoverflow projects={projects} categories={categories} />
      </div>
    </Section>
  );
}
