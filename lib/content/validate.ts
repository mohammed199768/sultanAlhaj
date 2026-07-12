import { CATEGORIES } from "@/lib/manifest/types";
import type { ProjectContent, ProjectSectionType } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTION_TYPES = new Set<ProjectSectionType>(["text", "gallery", "metrics", "services"]);
const STATUSES = new Set(["published", "preview", "draft"]);

export function validateProjects(projects: unknown[], assetFolders?: Set<string>): asserts projects is ProjectContent[] {
  const errors: string[] = [];
  const slugs = new Map<string, number>();
  const orders = new Map<number, string>();

  projects.forEach((raw, index) => {
    const project = raw as Partial<ProjectContent>;
    const label = typeof project.slug === "string" && project.slug ? project.slug : `file #${index + 1}`;
    const fail = (path: string, message: string) => errors.push(`Project "${label}":\n${path}:\n${message}`);

    if (project.schemaVersion !== 1) fail("schemaVersion", "Expected schema version 1");
    if (!project.slug || !SLUG.test(project.slug)) fail("slug", "Must be a non-empty lowercase URL slug");
    if (project.slug) {
      if (slugs.has(project.slug)) fail("slug", `Duplicate slug also used by project #${slugs.get(project.slug)! + 1}`);
      slugs.set(project.slug, index);
    }
    if (!project.status || !STATUSES.has(project.status)) fail("status", "Expected published, preview, or draft");
    if (!Number.isInteger(project.order)) fail("order", "Expected an integer");
    else if (orders.has(project.order!)) fail("order", `Duplicate order also used by "${orders.get(project.order!)}"`);
    else orders.set(project.order!, label);
    if (!project.identity?.title?.trim()) fail("identity.title", "Title is required");
    if (!project.identity?.client?.trim()) fail("identity.client", "Client is required");
    if (!project.identity?.category || !CATEGORIES.includes(project.identity.category)) fail("identity.category", "Unknown category");
    if (!project.summary?.trim()) fail("summary", "Summary is required");
    if (!project.description?.trim()) fail("description", "Description is required");
    if (!project.card?.imageAlt?.trim()) fail("card.imageAlt", "Alt text is required");
    if (!project.hero) fail("hero", "Hero data is required");
    if (!Array.isArray(project.gallery)) fail("gallery", "Expected an explicit gallery array");
    if (!Array.isArray(project.videos)) fail("videos", "Expected an explicit videos array");
    if (!Array.isArray(project.documents)) fail("documents", "Expected an explicit documents array");
    if (project.featured && !project.card?.image) fail("card.image", "Featured projects require an explicit card image");
    if (project.assetFolder && assetFolders && !assetFolders.has(project.assetFolder)) fail("assetFolder", `Folder "${project.assetFolder}" was not found in the generated manifest`);
    if (project.status === "published") {
      if (!project.card?.image) fail("card.image", "Published projects require explicit card media");
      if (!project.popup?.image) fail("popup.image", "Published projects require explicit popup media");
      if (!project.hero?.image) fail("hero.image", "Published projects require explicit hero media");
      if (!project.metadata?.ogImage) fail("metadata.ogImage", "Published projects require explicit metadata/OG media");
      const selectedCount = (project.gallery?.length ?? 0) + (project.videos?.length ?? 0) + (project.documents?.length ?? 0);
      if (selectedCount < 1) fail("gallery/videos/documents", "Published projects require meaningful explicitly selected production media");
    }
    if (project.status === "preview" && !project.popup?.previewLabel?.trim()) fail("popup.previewLabel", "Preview projects require a preview label so the UI cannot expose a broken full-route CTA");

    const ids = new Set<string>();
    (project.sections ?? []).forEach((section, sectionIndex) => {
      if (!section.id?.trim()) fail(`sections[${sectionIndex}].id`, "Section id is required");
      else if (ids.has(section.id)) fail(`sections[${sectionIndex}].id`, `Duplicate section id "${section.id}"`);
      else ids.add(section.id);
      if (!SECTION_TYPES.has(section.type)) fail(`sections[${sectionIndex}].type`, `Unknown section type "${String(section.type)}"`);
    });
  });

  const known = new Set(projects.map((p) => (p as Partial<ProjectContent>).slug).filter(Boolean));
  projects.forEach((raw) => {
    const project = raw as ProjectContent;
    [...(project.relatedProjects ?? []), ...(project.legacySlugs ?? []).filter((slug) => slug === project.slug)].forEach((slug) => {
      if ((project.relatedProjects ?? []).includes(slug) && !known.has(slug)) errors.push(`Project "${project.slug}":\nrelatedProjects:\nUnknown related slug "${slug}"`);
    });
  });

  if (errors.length) throw new Error(`Content validation failed with ${errors.length} error(s):\n\n${errors.join("\n\n")}`);
}
