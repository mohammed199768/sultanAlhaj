/**
 * generate-manifest.ts
 * Scans /public asset folders and emits a typed JSON manifest consumed at build time.
 * - Skips OS junk (.DS_Store, desktop.ini, __MACOSX, ._*)
 * - Classifies images / videos / pdfs
 * - Extracts image dimensions via sharp (best-effort)
 * - Marks .mov files with no browser-safe sibling as `unsupportedVideo`
 * - Produces safe, URL-encoded src paths + clean English display titles
 *
 * Output: lib/manifest/portfolio.generated.json
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateContentFiles } from "../lib/content/validateFiles";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "lib", "manifest", "portfolio.generated.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const PDF_EXT = new Set([".pdf"]);
const BROWSER_VIDEO = new Set([".mp4", ".webm"]);

const JUNK = new Set([".DS_Store", "desktop.ini", "Thumbs.db"]);
const CLIENT_SOURCE_ONLY = new Set(["4 (1).jpg"]);
const LFS_POINTER_PREFIX = "version https://git-lfs.github.com/spec/v1";
const FILE_NAME_COLLATOR = new Intl.Collator("en", {
  sensitivity: "variant",
});
const FLAT_FILE_NAME_COLLATOR = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "variant",
});

type MediaKind = "image" | "video" | "pdf";

interface MediaItem {
  kind: MediaKind;
  src: string; // web path, URL-encoded, e.g. /portfolio/Foo/bar.webp
  title: string;
  fileName: string;
  poster?: string;
  width?: number;
  height?: number;
  unsupportedVideo?: boolean; // .mov with no browser-safe transcode
}

interface PortfolioFolder {
  key: string; // raw folder name
  slug: string;
  images: number;
  videos: number;
  pdfs: number;
  media: MediaItem[];
}

interface Manifest {
  generatedAt: string;
  portfolio: PortfolioFolder[];
  works: MediaItem[];
  reels: MediaItem[];
  clients: MediaItem[];
  stats: {
    folders: number;
    images: number;
    videos: number;
    pdfs: number;
    unsupportedVideos: number;
  };
}

function isJunk(name: string): boolean {
  return JUNK.has(name) || name.startsWith("._") || name === "__MACOSX";
}

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTitle(fileNameNoExt: string, fallback: string): string {
  // Strip Arabic/non-latin, tidy separators.
  let t = fileNameNoExt
    .replace(/[؀-ۿݐ-ݿ]/g, " ") // Arabic ranges
    .replace(/[_\-]+/g, " ")
    .replace(/\b\d{4,}\b/g, "") // long id numbers
    .replace(/\s+/g, " ")
    .trim();
  if (!t || /^\d+$/.test(t)) return fallback;
  return t
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Encode each path segment but keep slashes. */
function webPath(absFile: string): string {
  const rel = path.relative(PUBLIC, absFile).split(path.sep).join("/");
  return "/" + rel.split("/").map(encodeURIComponent).join("/");
}

function classify(ext: string): MediaKind | null {
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (PDF_EXT.has(ext)) return "pdf";
  return null;
}

async function tryImageSize(
  absFile: string
): Promise<{ width?: number; height?: number }> {
  try {
    // Lazy import so the script still runs if sharp is missing.
    const sharp = (await import("sharp")).default;
    const meta = await sharp(absFile).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return {};
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (isJunk(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function buildMediaItem(
  absFile: string,
  fallbackTitle: string,
  siblings: Set<string>
): Promise<MediaItem | null> {
  const ext = path.extname(absFile).toLowerCase();
  const kind = classify(ext);
  if (!kind) return null;

  const handle = await fs.open(absFile, "r");
  try {
    const prefix = Buffer.alloc(LFS_POINTER_PREFIX.length);
    const { bytesRead } = await handle.read(prefix, 0, prefix.length, 0);
    if (prefix.subarray(0, bytesRead).toString("utf8") === LFS_POINTER_PREFIX) {
      throw new Error(
        `Git LFS object was not fetched: ${path.relative(ROOT, absFile)}`
      );
    }
  } finally {
    await handle.close();
  }

  const fileName = path.basename(absFile);
  const noExt = path.basename(absFile, path.extname(absFile));
  const title = toTitle(noExt, fallbackTitle);

  const item: MediaItem = {
    kind,
    src: webPath(absFile),
    title,
    fileName,
  };

  if (kind === "image") {
    const { width, height } = await tryImageSize(absFile);
    item.width = width;
    item.height = height;
  }

  if (kind === "video") {
    // Look for a browser-safe sibling (same basename, .mp4/.webm) or a poster.
    if (!BROWSER_VIDEO.has(ext)) {
      const hasSafe = [".mp4", ".webm"].some((e) =>
        siblings.has(noExt.toLowerCase() + e)
      );
      if (!hasSafe) item.unsupportedVideo = true;
    }
    const posterName = noExt.toLowerCase() + ".jpg";
    if (siblings.has(posterName)) {
      item.poster = webPath(path.join(path.dirname(absFile), noExt + ".jpg"));
    }
  }

  return item;
}

async function scanFolderGroup(baseDir: string): Promise<PortfolioFolder[]> {
  const folders: PortfolioFolder[] = [];
  let entries: import("node:fs").Dirent[] = [];
  try {
    entries = await fs.readdir(baseDir, { withFileTypes: true });
  } catch {
    return folders;
  }
  for (const e of entries) {
    if (!e.isDirectory() || isJunk(e.name)) continue;
    const dir = path.join(baseDir, e.name);
    const files = await walk(dir);
    const siblingNames = new Set(
      files.map((f) => path.basename(f).toLowerCase())
    );
    const media: MediaItem[] = [];
    for (const f of files) {
      const item = await buildMediaItem(f, e.name, siblingNames);
      if (item) media.push(item);
    }
    // Sort: images first, then videos, then pdfs; stable by filename.
    const order: Record<MediaKind, number> = { image: 0, video: 1, pdf: 2 };
    media.sort(
      (a, b) =>
        order[a.kind] - order[b.kind] ||
        FILE_NAME_COLLATOR.compare(a.fileName, b.fileName)
    );
    folders.push({
      key: e.name,
      slug: slugify(e.name),
      images: media.filter((m) => m.kind === "image").length,
      videos: media.filter((m) => m.kind === "video").length,
      pdfs: media.filter((m) => m.kind === "pdf").length,
      media,
    });
  }
  folders.sort((a, b) => FILE_NAME_COLLATOR.compare(a.key, b.key));
  return folders;
}

async function scanFlat(baseDir: string, fallback: string): Promise<MediaItem[]> {
  const files = await walk(baseDir);
  const siblingNames = new Set(files.map((f) => path.basename(f).toLowerCase()));
  const items: MediaItem[] = [];
  for (const f of files) {
    if (
      path.basename(baseDir) === "Inkspire clients logo" &&
      CLIENT_SOURCE_ONLY.has(path.basename(f))
    ) {
      continue;
    }
    const item = await buildMediaItem(f, fallback, siblingNames);
    if (item) items.push(item);
  }
  items.sort((a, b) => FLAT_FILE_NAME_COLLATOR.compare(a.fileName, b.fileName));
  return items;
}

async function main() {
  const portfolio = await scanFolderGroup(path.join(PUBLIC, "portfolio"));
  const works = await scanFlat(path.join(PUBLIC, "works"), "Work");
  const reels = await scanFlat(path.join(PUBLIC, "reels"), "Testimonial");
  const clients = await scanFlat(
    path.join(PUBLIC, "clients", "Inkspire clients logo"),
    "Client"
  );

  const allMedia = [
    ...portfolio.flatMap((p) => p.media),
    ...works,
    ...reels,
    ...clients,
  ];

  const manifest: Manifest = {
    generatedAt: "1970-01-01T00:00:00.000Z",
    portfolio,
    works,
    reels,
    clients,
    stats: {
      folders: portfolio.length,
      images: allMedia.filter((m) => m.kind === "image").length,
      videos: allMedia.filter((m) => m.kind === "video").length,
      pdfs: allMedia.filter((m) => m.kind === "pdf").length,
      unsupportedVideos: allMedia.filter((m) => m.unsupportedVideo).length,
    },
  };

  validateContentFiles(new Set(portfolio.map((folder) => folder.key)));
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(manifest, null, 2), "utf8");

  console.log("Manifest written:", path.relative(ROOT, OUT));
  console.log(
    `  folders=${manifest.stats.folders} images=${manifest.stats.images} videos=${manifest.stats.videos} pdfs=${manifest.stats.pdfs} unsupportedVideos=${manifest.stats.unsupportedVideos}`
  );
}

main().catch((err) => {
  console.error("generate-manifest failed:", err);
  process.exit(1);
});
