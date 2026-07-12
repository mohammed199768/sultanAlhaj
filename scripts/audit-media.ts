import { createReadStream, promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const PROJECTS = path.join(ROOT, "content", "projects");
const REPORT = path.join(ROOT, "docs", "MEDIA_AUDIT.md");
const CLEANUP_LOG = path.join(ROOT, "docs", "media-cleanup.json");
const BASELINE_REF = "backup-before-media-reduction-a3b51cc";
const MEDIA_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".m4v",
  ".mov",
  ".mp4",
  ".pdf",
  ".png",
  ".svg",
  ".webm",
  ".webp",
]);
const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);
const VIDEO_EXTENSIONS = new Set([".m4v", ".mov", ".mp4", ".webm"]);
const COLLATOR = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "variant",
});

interface ProjectContent {
  slug: string;
  status: "published" | "preview" | "draft";
  assetFolder?: string;
  card?: { image?: string };
  popup?: { image?: string };
  hero?: { image?: string };
  metadata?: { ogImage?: string };
}

interface MediaRecord {
  absolutePath: string;
  relativePath: string;
  publicPath: string;
  extension: string;
  size: number;
  hash: string;
  width?: number;
  height?: number;
  pages?: number;
  usages: string[];
}

interface BaselineRecord {
  relativePath: string;
  extension: string;
  size: number;
}

interface CleanupLog {
  baselineRef: string;
  removed: Array<{
    path: string;
    bytes: number;
    reason: string;
    tracked: boolean;
  }>;
}

function normalizePath(value: string): string {
  return value.split(path.sep).join("/");
}

function markdownPath(value: string): string {
  return `\`${value.replace(/`/g, "\\`")}\``;
}

function formatMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

function isKnownJunk(relativePath: string): boolean {
  const normalized = normalizePath(relativePath);
  const name = path.posix.basename(normalized);
  return (
    normalized.split("/").includes("__MACOSX") ||
    name.startsWith("._") ||
    name === ".DS_Store" ||
    name.toLowerCase() === "desktop.ini" ||
    name === "Thumbs.db"
  );
}

async function walk(directory: string): Promise<string[]> {
  const files: string[] = [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }
  entries.sort((a, b) => COLLATOR.compare(a.name, b.name));
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

async function sha256(file: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(file);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function gitLines(args: string[]): string[] {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .split(/\r?\n/)
      .filter(Boolean)
      .map(normalizePath);
  } catch {
    return [];
  }
}

function readBaselineRecords(ref: string): BaselineRecord[] {
  try {
    const lfsPaths = new Set(gitLines(["lfs", "ls-files", "-n", ref]));
    const output = execFileSync(
      "git",
      ["ls-tree", "-r", "-l", "-z", ref, "--", "public"],
      { cwd: ROOT }
    ).toString("utf8");
    const records: BaselineRecord[] = [];
    for (const entry of output.split("\0").filter(Boolean)) {
      const tab = entry.indexOf("\t");
      if (tab < 0) continue;
      const metadata = entry.slice(0, tab).trim().split(/\s+/);
      const relativePath = normalizePath(entry.slice(tab + 1));
      const extension = path.extname(relativePath).toLowerCase();
      if (!MEDIA_EXTENSIONS.has(extension) || isKnownJunk(relativePath)) continue;
      let size = Number(metadata[metadata.length - 1]);
      if (lfsPaths.has(relativePath)) {
        const pointer = execFileSync("git", ["show", `${ref}:${relativePath}`], {
          cwd: ROOT,
          encoding: "utf8",
        });
        const match = pointer.match(/^size (\d+)$/m);
        if (match) size = Number(match[1]);
      }
      if (Number.isFinite(size)) records.push({ relativePath, extension, size });
    }
    return records.sort((a, b) => COLLATOR.compare(a.relativePath, b.relativePath));
  } catch {
    return [];
  }
}

function collectPublicReferences(value: unknown, output: Set<string>): void {
  if (typeof value === "string") {
    if (value.startsWith("/")) {
      try {
        output.add(decodeURIComponent(value).replace(/^\//, ""));
      } catch {
        output.add(value.replace(/^\//, ""));
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectPublicReferences(item, output));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectPublicReferences(item, output));
  }
}

async function readProjects(): Promise<ProjectContent[]> {
  const files = (await fs.readdir(PROJECTS))
    .filter((file) => file.endsWith(".json"))
    .sort(COLLATOR.compare);
  return await Promise.all(
    files.map(async (file) =>
      JSON.parse(await fs.readFile(path.join(PROJECTS, file), "utf8"))
    )
  );
}

async function collectReferences(): Promise<Set<string>> {
  const references = new Set<string>();
  const contentFiles = (await walk(path.join(ROOT, "content"))).filter((file) =>
    file.endsWith(".json")
  );
  for (const file of contentFiles) {
    collectPublicReferences(JSON.parse(await fs.readFile(file, "utf8")), references);
  }

  const sourceRoots = ["app", "components", "lib", "scripts"];
  const pathPattern = /["'`](\/[^"]+?\.(?:avif|gif|jpe?g|m4v|mov|mp4|pdf|png|svg|webm|webp))["'`]/gi;
  for (const sourceRoot of sourceRoots) {
    const files = (await walk(path.join(ROOT, sourceRoot))).filter((file) =>
      /\.(?:css|js|json|mjs|ts|tsx)$/.test(file) &&
      path.basename(file) !== "portfolio.generated.json"
    );
    for (const file of files) {
      const text = await fs.readFile(file, "utf8");
      for (const match of text.matchAll(pathPattern)) {
        try {
          references.add(decodeURIComponent(match[1]).replace(/^\//, ""));
        } catch {
          references.add(match[1].replace(/^\//, ""));
        }
      }
    }
  }
  return references;
}

function proposedAction(record: MediaRecord): string {
  if (VIDEO_EXTENSIONS.has(record.extension)) {
    if (record.extension === ".mov") {
      return "Verify its MP4 sibling with ffprobe, then remove the source MOV only if duration, frames, and meaningful audio are preserved.";
    }
    return "Inspect with ffprobe and transcode to H.264/yuv420p/faststart at <=1080p and <=30 fps; preserve meaningful audio. External hosting remains safest until encoded.";
  }
  if (record.extension === ".pdf") {
    return "Use a PDF-specific optimizer and verify every page; Sharp cannot safely optimize PDF documents. Consider external object storage.";
  }
  if (IMAGE_EXTENSIONS.has(record.extension)) {
    return "Run media:optimize:dry; resize without upscaling and recompress only when the decoded result is smaller.";
  }
  return "Manual review required.";
}

async function main() {
  const cleanup = JSON.parse(await fs.readFile(CLEANUP_LOG, "utf8")) as CleanupLog;
  if (cleanup.baselineRef !== BASELINE_REF) {
    throw new Error(
      `Cleanup baseline ${cleanup.baselineRef} does not match audit baseline ${BASELINE_REF}`
    );
  }
  const projects = await readProjects();
  const projectByFolder = new Map(
    projects.filter((project) => project.assetFolder).map((project) => [project.assetFolder!, project])
  );
  const references = await collectReferences();
  const allPublicFiles = await walk(PUBLIC);
  const allMediaFiles = allPublicFiles.filter((file) =>
    MEDIA_EXTENSIONS.has(path.extname(file).toLowerCase())
  );
  const confirmedUnusedPaths = allMediaFiles
    .map((file) => normalizePath(path.relative(ROOT, file)))
    .filter(isKnownJunk)
    .sort(COLLATOR.compare);
  const mediaFiles = allMediaFiles.filter(
    (file) => !isKnownJunk(normalizePath(path.relative(ROOT, file)))
  );
  const records: MediaRecord[] = [];

  for (const absolutePath of mediaFiles) {
    const relativePath = normalizePath(path.relative(ROOT, absolutePath));
    const publicPath = normalizePath(path.relative(PUBLIC, absolutePath));
    const extension = path.extname(absolutePath).toLowerCase();
    const stat = await fs.stat(absolutePath);
    const usages: string[] = [];
    const segments = publicPath.split("/");

    if (segments[0] === "portfolio" && segments.length > 2) {
      const project = projectByFolder.get(segments[1]);
      usages.push(
        project
          ? `asset-folder:${project.slug}:${project.status}`
          : `unmapped-portfolio-folder:${segments[1]}`
      );
    }
    if (segments[0] === "works") usages.push("manifest:works");
    if (segments[0] === "reels") usages.push("manifest:reels");
    if (
      segments[0] === "clients" &&
      segments[1] === "Inkspire clients logo"
    ) {
      usages.push("manifest:clients");
    }
    if (references.has(publicPath)) usages.push("direct-reference");

    const record: MediaRecord = {
      absolutePath,
      relativePath,
      publicPath,
      extension,
      size: stat.size,
      hash: await sha256(absolutePath),
      usages: Array.from(new Set(usages)).sort(COLLATOR.compare),
    };
    if (IMAGE_EXTENSIONS.has(extension)) {
      try {
        const metadata = await sharp(absolutePath, { animated: true }).metadata();
        record.width = metadata.width;
        record.height = metadata.height;
        record.pages = metadata.pages;
      } catch {
        // Decode failures remain visible through missing dimensions in the report.
      }
    }
    records.push(record);
  }

  records.sort((a, b) => COLLATOR.compare(a.relativePath, b.relativePath));
  const byExtension = new Map<string, MediaRecord[]>();
  const byHash = new Map<string, MediaRecord[]>();
  for (const record of records) {
    const extensionRecords = byExtension.get(record.extension) ?? [];
    extensionRecords.push(record);
    byExtension.set(record.extension, extensionRecords);
    const hashRecords = byHash.get(record.hash) ?? [];
    hashRecords.push(record);
    byHash.set(record.hash, hashRecords);
  }

  const duplicateGroups = Array.from(byHash.values())
    .filter((group) => group.length > 1)
    .sort((a, b) => COLLATOR.compare(a[0].relativePath, b[0].relativePath));
  const nearDuplicateGroups = new Map<string, MediaRecord[]>();
  for (const record of records) {
    const stem = path.basename(record.relativePath, path.extname(record.relativePath)).toLowerCase();
    const key = `${normalizePath(path.dirname(record.relativePath)).toLowerCase()}/${stem}`;
    const group = nearDuplicateGroups.get(key) ?? [];
    group.push(record);
    nearDuplicateGroups.set(key, group);
  }
  const nearDuplicates = Array.from(nearDuplicateGroups.values())
    .filter((group) => group.length > 1 && new Set(group.map((item) => item.hash)).size > 1)
    .sort((a, b) => COLLATOR.compare(a[0].relativePath, b[0].relativePath));

  const lfsPaths = new Set(gitLines(["lfs", "ls-files", "-n", "HEAD"]));
  const originLfsPaths = new Set(gitLines(["lfs", "ls-files", "-n", "origin/main"]));
  const changedPaths = new Set(
    execFileSync("git", ["diff", "--name-only", "-z", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean)
      .map(normalizePath)
  );
  const newLfsPaths = Array.from(lfsPaths)
    .filter((file) => changedPaths.has(file) && !originLfsPaths.has(file))
    .sort(COLLATOR.compare);
  const possiblyUnused = records.filter((record) => record.usages.length === 0);
  const totalBytes = records.reduce((sum, record) => sum + record.size, 0);
  const baselineRecords = readBaselineRecords(BASELINE_REF);
  const baselineBytes = baselineRecords.reduce((sum, record) => sum + record.size, 0);
  const baselinePaths = new Set(baselineRecords.map((record) => record.relativePath));
  const currentPaths = new Set(records.map((record) => record.relativePath));
  const removedSinceBaseline = baselineRecords.filter(
    (record) => !currentPaths.has(record.relativePath)
  );
  const addedSinceBaseline = records.filter(
    (record) => !baselinePaths.has(record.relativePath)
  );
  const lfsBytes = records
    .filter((record) => lfsPaths.has(record.relativePath))
    .reduce((sum, record) => sum + record.size, 0);
  const largeFiles = records
    .filter((record) => record.size > 5 * 1024 * 1024)
    .sort((a, b) => b.size - a.size || COLLATOR.compare(a.relativePath, b.relativePath));
  const topFiles = [...records]
    .sort((a, b) => b.size - a.size || COLLATOR.compare(a.relativePath, b.relativePath))
    .slice(0, 50);

  const lines: string[] = [
    "# Media Audit",
    "",
    "> Generated deterministically by `npm run media:audit`. This command does not modify media files.",
    "",
    "## Executive summary",
    "",
    `- Media files: **${records.length}**`,
    `- Baseline production media at ${BASELINE_REF}: **${baselineRecords.length} files / ${formatMb(
      baselineBytes
    )} MB**`,
    `- Current production media: **${records.length} files / ${formatMb(totalBytes)} MB**`,
    `- Change from baseline: **${formatMb(totalBytes - baselineBytes)} MB**`,
    `- Git LFS media in local HEAD: **${lfsPaths.size} files / ${formatMb(lfsBytes)} MB**`,
    `- Git LFS media already present on origin/main: **${originLfsPaths.size} files**`,
    `- New LFS paths introduced after origin/main: **${newLfsPaths.length}**`,
    `- Exact duplicate groups: **${duplicateGroups.length}**`,
    `- Possibly unused files requiring manual review: **${possiblyUnused.length}**`,
    `- Confirmed unused OS metadata currently present: **${confirmedUnusedPaths.length}**`,
    `- Recorded safe cleanup groups: **${cleanup.removed.length}**`,
    "- FFmpeg/ffprobe: **not available in the audited environment**",
    "- Estimated size after safe optimization: **not defensibly calculable** until production videos and PDFs are inspected with format-specific tools.",
    "- External hosting is still required unless the video/PDF set is editorially reduced and re-encoded below normal-Git targets.",
    "",
    "## Counts and sizes by extension",
    "",
    "| Extension | Baseline count | Baseline MB | Current count | Current MB |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];

  const extensions = Array.from(
    new Set([...byExtension.keys(), ...baselineRecords.map((record) => record.extension)])
  ).sort(COLLATOR.compare);
  for (const extension of extensions) {
    const extensionRecords = byExtension.get(extension) ?? [];
    const baselineExtensionRecords = baselineRecords.filter(
      (record) => record.extension === extension
    );
    lines.push(
      `| ${extension || "(none)"} | ${baselineExtensionRecords.length} | ${formatMb(
        baselineExtensionRecords.reduce((sum, record) => sum + record.size, 0)
      )} | ${extensionRecords.length} | ${formatMb(
        extensionRecords.reduce((sum, record) => sum + record.size, 0)
      )} |`
    );
  }

  lines.push(
    "",
    "## Top 50 largest files",
    "",
    "| # | Size MB | Type | Dimensions | File | Usage |",
    "| ---: | ---: | --- | --- | --- | --- |"
  );
  topFiles.forEach((record, index) => {
    const dimensions = record.width && record.height ? `${record.width}x${record.height}` : "-";
    lines.push(
      `| ${index + 1} | ${formatMb(record.size)} | ${record.extension} | ${dimensions} | ${markdownPath(
        record.relativePath
      )} | ${record.usages.join(", ") || "manual review"} |`
    );
  });

  lines.push("", "## Git LFS inventory", "");
  if (lfsPaths.size === 0) lines.push("No LFS-managed media in HEAD.");
  else {
    lines.push("| Size MB | New after origin/main | File |", "| ---: | --- | --- |");
    records
      .filter((record) => lfsPaths.has(record.relativePath))
      .sort((a, b) => COLLATOR.compare(a.relativePath, b.relativePath))
      .forEach((record) =>
        lines.push(
          `| ${formatMb(record.size)} | ${newLfsPaths.includes(record.relativePath) ? "yes" : "no"} | ${markdownPath(
            record.relativePath
          )} |`
        )
      );
  }

  lines.push("", "## Exact duplicate groups (SHA-256)", "");
  if (duplicateGroups.length === 0) lines.push("No exact byte-for-byte duplicates found.");
  duplicateGroups.forEach((group, index) => {
    lines.push(`### Duplicate group ${index + 1}`, "", `SHA-256: \`${group[0].hash}\``, "");
    group.forEach((record) =>
      lines.push(`- ${formatMb(record.size)} MB - ${markdownPath(record.relativePath)}`)
    );
    lines.push(
      "",
      "Do not delete automatically: separate asset-folder paths may be part of gallery order or project identity."
    );
  });

  lines.push("", "## Near-duplicate/source-transcode candidates", "");
  if (nearDuplicates.length === 0) lines.push("No same-stem candidates found.");
  nearDuplicates.forEach((group) => {
    lines.push(`- ${group.map((record) => markdownPath(record.relativePath)).join("; ")}`);
  });

  lines.push("", "## Confirmed unused files", "");
  if (confirmedUnusedPaths.length === 0) lines.push("None.");
  else {
    lines.push(
      "These are AppleDouble/OS metadata files. The manifest and transcode walkers explicitly skip `__MACOSX`, `._*`, and OS metadata names."
    );
    confirmedUnusedPaths.forEach((file) => lines.push(`- ${markdownPath(file)}`));
  }
  lines.push(
    "",
    "## Possibly unused files requiring manual review",
    "",
    "These files are outside generator-scanned groups and were not found as direct source/content references. They are not safe to delete without visual and route review."
  );
  if (possiblyUnused.length === 0) lines.push("", "None.");
  else possiblyUnused.forEach((record) => lines.push(`- ${markdownPath(record.relativePath)}`));

  lines.push("", "## Recorded safe cleanup", "");
  cleanup.removed.forEach((entry) =>
    lines.push(
      `- ${formatMb(entry.bytes)} MB - ${markdownPath(entry.path)} - ${entry.reason} (${
        entry.tracked ? "tracked change" : "untracked local cleanup"
      })`
    )
  );

  lines.push("", `## Changes since ${BASELINE_REF}`, "");
  if (removedSinceBaseline.length === 0) lines.push("- Removed production media: none");
  else {
    lines.push("- Removed production media:");
    removedSinceBaseline.forEach((record) =>
      lines.push(`  - ${formatMb(record.size)} MB - ${markdownPath(record.relativePath)}`)
    );
  }
  if (addedSinceBaseline.length === 0) lines.push("- Added production media: none");
  else {
    lines.push("- Added production media:");
    addedSinceBaseline.forEach((record) =>
      lines.push(`  - ${formatMb(record.size)} MB - ${markdownPath(record.relativePath)}`)
    );
  }

  for (const status of ["published", "preview"] as const) {
    lines.push("", `## ${status === "published" ? "Published" : "Preview"} project media inventory`, "");
    const matchingProjects = projects
      .filter((project) => project.status === status)
      .sort((a, b) => COLLATOR.compare(a.slug, b.slug));
    lines.push("| Project | Asset folder | Files | Total MB | Explicit paths |", "| --- | --- | ---: | ---: | --- |");
    for (const project of matchingProjects) {
      const folderPrefix = project.assetFolder ? `public/portfolio/${project.assetFolder}/` : undefined;
      const folderRecords = folderPrefix
        ? records.filter((record) => record.relativePath.startsWith(folderPrefix))
        : [];
      const explicitPaths = [
        project.card?.image,
        project.popup?.image,
        project.hero?.image,
        project.metadata?.ogImage,
      ].filter((value): value is string => Boolean(value));
      lines.push(
        `| ${project.slug} | ${project.assetFolder ?? "-"} | ${folderRecords.length} | ${formatMb(
          folderRecords.reduce((sum, record) => sum + record.size, 0)
        )} | ${explicitPaths.length ? explicitPaths.map(markdownPath).join("<br>") : "-"} |`
      );
    }
  }

  lines.push(
    "",
    "## Proposed optimization for files larger than 5 MB",
    "",
    "| Size MB | File | Proposed action |",
    "| ---: | --- | --- |"
  );
  largeFiles.forEach((record) =>
    lines.push(
      `| ${formatMb(record.size)} | ${markdownPath(record.relativePath)} | ${proposedAction(record)} |`
    )
  );

  const unsafeNormalGit = records
    .filter(
      (record) =>
        record.size > 25 * 1024 * 1024 &&
        (VIDEO_EXTENSIONS.has(record.extension) || record.extension === ".pdf")
    )
    .sort((a, b) => b.size - a.size || COLLATOR.compare(a.relativePath, b.relativePath));
  lines.push(
    "",
    "## Files unsafe for normal Git without further work",
    "",
    "The following video/PDF files exceed the project's conservative 25 MB production-media target. Files over 100 MiB also exceed GitHub's normal-Git per-file limit.",
    ""
  );
  unsafeNormalGit.forEach((record) =>
    lines.push(
      `- ${formatMb(record.size)} MB${record.size > 100 * 1024 * 1024 ? " (**over 100 MiB**)" : ""} - ${markdownPath(
        record.relativePath
      )}`
    )
  );

  lines.push(
    "",
    "## External-hosting conclusion",
    "",
    `The current video/PDF payload is ${formatMb(
      records
        .filter((record) => VIDEO_EXTENSIONS.has(record.extension) || record.extension === ".pdf")
        .reduce((sum, record) => sum + record.size, 0)
    )} MB. Without FFmpeg/ffprobe and a PDF optimizer, safely reaching the preferred 200 MB normal-Git target is not currently possible. Preserve these assets on the backup branch and move the reviewed production set to Cloudinary, R2, S3, or equivalent object storage before removing LFS. No external URLs are fabricated by this audit.`
  );

  await fs.mkdir(path.dirname(REPORT), { recursive: true });
  await fs.writeFile(REPORT, `${lines.join("\n")}\n`, "utf8");
  console.log(`Media audit written: ${normalizePath(path.relative(ROOT, REPORT))}`);
  console.log(`  files=${records.length} totalMB=${formatMb(totalBytes)} duplicates=${duplicateGroups.length}`);
  console.log(`  lfs=${lfsPaths.size} newLfs=${newLfsPaths.length} possiblyUnused=${possiblyUnused.length}`);
}

main().catch((error) => {
  console.error("media audit failed:", error);
  process.exit(1);
});
