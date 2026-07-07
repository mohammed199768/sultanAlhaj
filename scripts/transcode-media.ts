/**
 * transcode-media.ts
 * Optional: converts browser-unfriendly videos (.mov/.m4v) in /public/portfolio
 * to web-safe .mp4 (H.264/AAC) and generates a poster .jpg.
 * Skips files that already have an .mp4 sibling. No-op if ffmpeg is unavailable.
 *
 * Run: npm run transcode
 */
import { promises as fs } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORTFOLIO = path.join(ROOT, "public", "portfolio");
const SRC_EXT = new Set([".mov", ".m4v"]);

function hasFfmpeg(): boolean {
  const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  return r.status === 0;
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
    if (e.name.startsWith("._") || e.name === "__MACOSX") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!hasFfmpeg()) {
    console.log("ffmpeg not found — skipping transcode. Videos will use fallback cards.");
    return;
  }
  const files = (await walk(PORTFOLIO)).filter((f) =>
    SRC_EXT.has(path.extname(f).toLowerCase())
  );
  if (!files.length) {
    console.log("No .mov/.m4v files to transcode.");
    return;
  }
  console.log(`Transcoding ${files.length} video(s)...`);
  for (const src of files) {
    const dir = path.dirname(src);
    const base = path.basename(src, path.extname(src));
    const mp4 = path.join(dir, base + ".mp4");
    const poster = path.join(dir, base + ".jpg");

    if (!(await exists(mp4))) {
      console.log("  →", path.relative(ROOT, mp4));
      const r = spawnSync(
        "ffmpeg",
        [
          "-y", "-i", src,
          "-vf", "scale='min(1280,iw)':-2",
          "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
          "-movflags", "+faststart",
          "-c:a", "aac", "-b:a", "128k",
          mp4,
        ],
        { stdio: "ignore" }
      );
      if (r.status !== 0) console.warn("    ffmpeg failed for", src);
    }
    if (!(await exists(poster))) {
      spawnSync(
        "ffmpeg",
        ["-y", "-i", src, "-ss", "00:00:01", "-vframes", "1", "-vf", "scale='min(1280,iw)':-2", poster],
        { stdio: "ignore" }
      );
    }
  }
  console.log("Transcode complete.");
}

main().catch((err) => {
  console.error("transcode-media failed:", err);
  process.exit(1);
});
