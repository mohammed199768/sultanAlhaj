import { validateContentFiles } from "../lib/content/validateFiles";

try {
  const projects = validateContentFiles();
  const published = projects.filter((project) => project.status === "published").length;
  const preview = projects.filter((project) => project.status === "preview").length;
  const draft = projects.filter((project) => project.status === "draft").length;
  console.log(`Content valid: ${projects.length} projects (${published} published, ${preview} preview, ${draft} draft)`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
