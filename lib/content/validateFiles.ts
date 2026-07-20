import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { ProjectContent } from "./types";
import { validateProjects } from "./validate";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);

function readJson(file: string): unknown {
  try { return JSON.parse(readFileSync(file, "utf8")); }
  catch (error) { throw new Error(`${path.relative(process.cwd(), file)}: invalid JSON\n${error instanceof Error ? error.message : String(error)}`); }
}

export function readProjectFiles(): ProjectContent[] {
  const directory = path.join(process.cwd(), "content", "projects");
  return readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => readJson(path.join(directory, file))) as ProjectContent[];
}

function walkFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolute) : [absolute];
  });
}

function resolveExactPublicReference(publicRoot: string, value: string): { absolute?: string; error?: string } {
  if (!value.startsWith("/")) return { error: `media path must start with "/": ${value}` };
  let decoded: string;
  try { decoded = decodeURIComponent(value); }
  catch { return { error: `media path is not valid URL encoding: ${value}` }; }
  const segments = decoded.replace(/^\/+/, "").split("/");
  if (!segments.length || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return { error: `media path contains an invalid segment: ${value}` };
  }
  let current = publicRoot;
  for (const segment of segments) {
    if (!existsSync(current)) return { error: `unknown media path: ${value}` };
    const entries = readdirSync(current, { withFileTypes: true });
    const exact = entries.find((entry) => entry.name === segment);
    if (!exact) {
      const differentCase = entries.find((entry) => entry.name.toLocaleLowerCase("en") === segment.toLocaleLowerCase("en"));
      if (differentCase) return { error: `invalid casing in media path: ${value}; expected segment "${differentCase.name}"` };
      return { error: `unknown media path: ${value}` };
    }
    current = path.join(current, exact.name);
  }
  if (!existsSync(current)) return { error: `unknown media path: ${value}` };
  return { absolute: current };
}

export function validateContentFiles(assetFolders?: Set<string>): ProjectContent[] {
  const root = process.cwd();
  const projects = readProjectFiles();
  const folders = assetFolders ?? new Set(readdirSync(path.join(root, "public", "portfolio"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name));
  validateProjects(projects, folders);
  const errors: string[] = [];
  const publicRoot = path.join(root, "public");
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const mappedFolders = new Map<string, string>();
  for (const project of projects) {
    if (project.assetFolder) {
      const previous = mappedFolders.get(project.assetFolder);
      if (previous) errors.push(`Project "${project.slug}": assetFolder "${project.assetFolder}" is already mapped by "${previous}"`);
      mappedFolders.set(project.assetFolder, project.slug);
    }
    const validateReference = (label: string, value: string | null, expected: "image" | "video" | "pdf") => {
      if (!value) return;
      const resolved = resolveExactPublicReference(publicRoot, value);
      if (resolved.error) {
        const pdfLabel = expected === "pdf" ? "excluded or missing PDF reference" : resolved.error;
        errors.push(`Project "${project.slug}": ${label}: ${pdfLabel}: ${value}`);
        return;
      }
      const extension = path.extname(decodeURIComponent(value)).toLowerCase();
      if (extension === ".mov" || extension === ".m4v") errors.push(`Project "${project.slug}": ${label}: raw MOV reference is forbidden: ${value}`);
      if (expected === "image" && !IMAGE_EXTENSIONS.has(extension)) errors.push(`Project "${project.slug}": ${label}: expected an image path: ${value}`);
      if (expected === "video" && !VIDEO_EXTENSIONS.has(extension)) errors.push(`Project "${project.slug}": ${label}: expected a browser-safe MP4/WebM path: ${value}`);
      if (expected === "pdf" && extension !== ".pdf") errors.push(`Project "${project.slug}": ${label}: expected a PDF path: ${value}`);
    };

    validateReference("card.image", project.card.image, "image");
    validateReference("popup.image", project.popup.image, "image");
    validateReference("hero.image", project.hero.image, "image");
    validateReference("metadata.ogImage", project.metadata.ogImage, "image");

    const editorialSelections: { label: string; value: string }[] = [];
    (project.gallery ?? []).forEach((value, index) => {
      validateReference(`gallery[${index}]`, value, "image");
      editorialSelections.push({ label: `gallery[${index}]`, value });
    });
    (project.videos ?? []).forEach((item, index) => {
      validateReference(`videos[${index}].src`, item.src, "video");
      if (!item.poster) errors.push(`Project "${project.slug}": videos[${index}].poster: missing poster`);
      else validateReference(`videos[${index}].poster`, item.poster, "image");
      editorialSelections.push({ label: `videos[${index}].src`, value: item.src });
    });
    (project.documents ?? []).forEach((item, index) => {
      validateReference(`documents[${index}].src`, item.src, "pdf");
      if (!item.title?.trim()) errors.push(`Project "${project.slug}": documents[${index}].title: document title is required`);
      editorialSelections.push({ label: `documents[${index}].src`, value: item.src });
    });
    const firstSelection = new Map<string, string>();
    for (const selection of editorialSelections) {
      const prior = firstSelection.get(selection.value);
      if (prior) errors.push(`Project "${project.slug}": duplicate media selection: ${selection.label} repeats ${prior}: ${selection.value}`);
      else firstSelection.set(selection.value, selection.label);
    }
  }
  for (const folder of folders) if (!mappedFolders.has(folder)) errors.push(`Portfolio asset folder "${folder}" has no canonical project JSON`);
  for (const file of walkFiles(path.join(publicRoot, "portfolio"))) {
    if ([".mov", ".m4v"].includes(path.extname(file).toLowerCase())) {
      errors.push(`Raw MOV remains under public: ${path.relative(root, file).split(path.sep).join("/")}`);
    }
  }

  const home = readJson(path.join(root, "content", "home.json")) as { caseStudies?: { projectSlugs?: string[] } };
  for (const slug of home.caseStudies?.projectSlugs ?? []) if (!bySlug.has(slug)) errors.push(`content/home.json: unknown case-study slug "${slug}"`);
  const profile = readJson(path.join(root, "content", "profile.json")) as {
    contact?: { email?: string; phoneE164?: string };
    links?: Record<"email" | "phone" | "whatsapp" | "linkedin" | "portfolio", string>;
    formEndpoint?: string;
  };
  if (!profile.contact?.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.contact.email)) errors.push("content/profile.json: invalid contact.email");
  if (!profile.contact?.phoneE164 || !/^\+[1-9]\d{7,14}$/.test(profile.contact.phoneE164)) errors.push("content/profile.json: invalid contact.phoneE164");
  for (const key of ["email", "phone", "whatsapp", "linkedin", "portfolio"] as const) {
    const value = profile.links?.[key];
    if (!value) errors.push(`content/profile.json: missing links.${key}`);
    else try { new URL(value); } catch { errors.push(`content/profile.json: invalid links.${key}`); }
  }
  if (profile.contact?.email && profile.links?.email !== `mailto:${profile.contact.email}`) errors.push("content/profile.json: links.email does not match contact.email");
  if (profile.contact?.phoneE164 && profile.links?.phone !== `tel:${profile.contact.phoneE164}`) errors.push("content/profile.json: links.phone does not match contact.phoneE164");
  if (profile.contact?.phoneE164 && profile.links?.whatsapp !== `https://wa.me/${profile.contact.phoneE164.slice(1)}`) errors.push("content/profile.json: links.whatsapp does not match contact.phoneE164");
  if (profile.formEndpoint) { try { new URL(profile.formEndpoint); } catch { errors.push("content/profile.json: invalid formEndpoint URL"); } }
  const site = readJson(path.join(root, "content", "site.json")) as { siteUrl?: string };
  if (site.siteUrl !== profile.links?.portfolio) errors.push("content/site.json: siteUrl does not match content/profile.json links.portfolio");
  for (const file of ["navigation.json", "contact.json", "cv.json"]) readJson(path.join(root, "content", file));
  if (errors.length) throw new Error(`Content validation failed with ${errors.length} error(s):\n\n${errors.join("\n")}`);
  return projects;
}
