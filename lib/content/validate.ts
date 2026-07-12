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
    if (project.featured && !project.assetFolder && !project.card?.image) fail("card.image", "Featured projects require an explicit card image or an asset folder");
    if (project.assetFolder && assetFolders && !assetFolders.has(project.assetFolder)) fail("assetFolder", `Folder "${project.assetFolder}" was not found in the generated manifest`);
    if (project.status === "published" && !project.assetFolder && !(project.sections ?? []).some((s) => (s.body?.length ?? 0) > 0)) fail("sections", "Published case studies require meaningful detail content or an asset folder");

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
