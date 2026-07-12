import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { ProjectContent } from "./types";
import { validateProjects } from "./validate";

function readJson(file: string): unknown {
  try { return JSON.parse(readFileSync(file, "utf8")); }
  catch (error) { throw new Error(`${path.relative(process.cwd(), file)}: invalid JSON\n${error instanceof Error ? error.message : String(error)}`); }
}

export function readProjectFiles(): ProjectContent[] {
  const directory = path.join(process.cwd(), "content", "projects");
  return readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => readJson(path.join(directory, file))) as ProjectContent[];
}

export function validateContentFiles(assetFolders?: Set<string>): ProjectContent[] {
  const root = process.cwd();
  const projects = readProjectFiles();
  const folders = assetFolders ?? new Set(readdirSync(path.join(root, "public", "portfolio"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name));
  validateProjects(projects, folders);
  const errors: string[] = [];
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const mappedFolders = new Map<string, string>();
  for (const project of projects) {
    if (project.assetFolder) {
      const previous = mappedFolders.get(project.assetFolder);
      if (previous) errors.push(`Project "${project.slug}": assetFolder "${project.assetFolder}" is already mapped by "${previous}"`);
      mappedFolders.set(project.assetFolder, project.slug);
    }
    for (const value of [project.card.image, project.popup.image, project.hero.image, project.metadata.ogImage].filter(Boolean) as string[]) {
      if (value.startsWith("/") && !existsSync(path.join(root, "public", decodeURIComponent(value)))) errors.push(`Project "${project.slug}": referenced asset does not exist: ${value}`);
    }
  }
  for (const folder of folders) if (!mappedFolders.has(folder)) errors.push(`Portfolio asset folder "${folder}" has no canonical project JSON`);

  const home = readJson(path.join(root, "content", "home.json")) as { caseStudies?: { projectSlugs?: string[] } };
  for (const slug of home.caseStudies?.projectSlugs ?? []) if (!bySlug.has(slug)) errors.push(`content/home.json: unknown case-study slug "${slug}"`);
  const profile = readJson(path.join(root, "content", "profile.json")) as { email?: string; formEndpoint?: string };
  if (!profile.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) errors.push("content/profile.json: invalid email");
  if (profile.formEndpoint) { try { new URL(profile.formEndpoint); } catch { errors.push("content/profile.json: invalid formEndpoint URL"); } }
  for (const file of ["site.json", "navigation.json", "contact.json", "cv.json"]) readJson(path.join(root, "content", file));
  if (errors.length) throw new Error(`Content validation failed with ${errors.length} error(s):\n\n${errors.join("\n")}`);
  return projects;
}
