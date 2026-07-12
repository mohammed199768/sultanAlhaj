import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const LOG = path.join(ROOT, "docs", "image-optimization-log.json");
const APPLY = process.argv.includes("--apply");
const DRY_RUN = !APPLY;
const MINIMUM_SIZE = 256 * 1024;
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SKIP_PATH = /(?:^|\/)(?:clients|fonts?|icons?|logos?)(?:\/|$)|favicon/i;
const COLLATOR = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "variant",
});

function normalizePath(value: string): string {
  return value.split(path.sep).join("/");
}

function formatMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

async function walk(directory: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  entries.sort((a, b) => COLLATOR.compare(a.name, b.name));
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

function maximumEdge(relativePath: string): number {
  if (relativePath.startsWith("public/works/")) return 1400;
  if (relativePath.startsWith("public/portfolio/")) return 1800;
  if (/mobile/i.test(relativePath)) return 1200;
  return 2200;
}

async function encode(file: string, extension: string, maxEdge: number): Promise<Buffer> {
  const input = await fs.readFile(file);
  const metadata = await sharp(input, { animated: true }).metadata();
  if ((metadata.pages ?? 1) > 1) throw new Error("animated/multi-page image");
  if (!metadata.width || !metadata.height) throw new Error("missing image dimensions");

  let pipeline = sharp(input, { failOn: "error" }).rotate();
  if (Math.max(metadata.width, metadata.height) > maxEdge) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    return await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  }
  if (extension === ".png") {
    return await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
      .toBuffer();
  }
  return await pipeline.webp({ quality: 82, effort: 5 }).toBuffer();
}

async function replaceSafely(file: string, output: Buffer): Promise<void> {
  const temporary = `${file}.codex-optimized-tmp`;
  const backup = `${file}.codex-original-tmp`;
  if ((await fs.stat(file)).size <= output.length) return;
  for (const candidate of [temporary, backup]) {
    try {
      await fs.access(candidate);
      throw new Error(`temporary safety file already exists: ${candidate}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  let originalMoved = false;
  try {
    await fs.writeFile(temporary, output, { flag: "wx" });
    await sharp(await fs.readFile(temporary)).metadata();
    await fs.rename(file, backup);
    originalMoved = true;
    await fs.rename(temporary, file);
    await sharp(await fs.readFile(file)).metadata();
    await fs.unlink(backup);
  } catch (error) {
    if (originalMoved) {
      try {
        await fs.unlink(file);
      } catch {
        // The optimized destination may not have been created.
      }
      await fs.rename(backup, file);
    }
    try {
      await fs.unlink(temporary);
    } catch {
      // The temporary file may already have been renamed.
    }
    throw error;
  }
}

async function main() {
  const files = (await walk(PUBLIC)).filter((file) =>
    EXTENSIONS.has(path.extname(file).toLowerCase())
  );
  let reviewed = 0;
  let candidates = 0;
  let originalBytes = 0;
  let proposedBytes = 0;
  const transformations: { path: string; beforeSizeBytes: number; afterSizeBytes: number; maximumEdge: number; quality: number }[] = [];

  console.log(`Image optimization mode: ${DRY_RUN ? "dry-run" : "apply"}`);
  for (const file of files) {
    const relativePath = normalizePath(path.relative(ROOT, file));
    const extension = path.extname(file).toLowerCase();
    const stat = await fs.stat(file);
    if (stat.size < MINIMUM_SIZE || SKIP_PATH.test(relativePath)) continue;
    reviewed++;
    try {
      const output = await encode(file, extension, maximumEdge(relativePath));
      if (output.length >= stat.size) continue;
      const savings = stat.size - output.length;
      if (savings < 64 * 1024 || savings / stat.size < 0.05) continue;
      candidates++;
      originalBytes += stat.size;
      proposedBytes += output.length;
      console.log(
        `${DRY_RUN ? "WOULD_OPTIMIZE" : "OPTIMIZE"} ${relativePath}: ${formatMb(
          stat.size
        )} MB -> ${formatMb(output.length)} MB`
      );
      if (APPLY) {
        await replaceSafely(file, output);
        transformations.push({
          path: relativePath,
          beforeSizeBytes: stat.size,
          afterSizeBytes: (await fs.stat(file)).size,
          maximumEdge: maximumEdge(relativePath),
          quality: 82,
        });
      }
    } catch (error) {
      console.warn(
        `SKIP ${relativePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  console.log(
    `Reviewed ${reviewed} images; candidates=${candidates}; potential savings=${formatMb(
      originalBytes - proposedBytes
    )} MB`
  );
  if (APPLY) {
    let combined = transformations;
    try {
      const existing = JSON.parse(await fs.readFile(LOG, "utf8")) as { transformations?: typeof transformations };
      const byPath = new Map((existing.transformations ?? []).map((item) => [item.path, item]));
      for (const item of transformations) byPath.set(item.path, item);
      combined = [...byPath.values()].sort((a, b) => COLLATOR.compare(a.path, b.path));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    await fs.writeFile(
      LOG,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), transformations: combined }, null, 2)}\n`,
      "utf8"
    );
    console.log(`Transformation log: ${normalizePath(path.relative(ROOT, LOG))}`);
  }
  if (DRY_RUN) console.log("No files were modified. Use --apply only after reviewing this output.");
}

main().catch((error) => {
  console.error("image optimization failed:", error);
  process.exit(1);
});
