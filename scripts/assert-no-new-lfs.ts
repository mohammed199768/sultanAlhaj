import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const BASE = "origin/main";
const LFS_POINTER = "version https://git-lfs.github.com/spec/v1";
const MAX_BINARY_BYTES = 25 * 1024 * 1024;
const BINARY_EXTENSIONS = new Set([
  ".avif", ".gif", ".jpeg", ".jpg", ".mov", ".mp4", ".pdf", ".png", ".webm", ".webp",
]);

function gitBuffer(args: string[]): Buffer {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "buffer" });
  if (result.status !== 0) {
    throw new Error("git " + args.join(" ") + " failed:\n" + result.stderr.toString("utf8"));
  }
  return result.stdout;
}

function nulPaths(buffer: Buffer): string[] {
  return buffer.toString("utf8").split("\0").filter(Boolean);
}

function checkAttribute(file: string): string | undefined {
  const output = gitBuffer(["check-attr", "-z", "filter", "--", file]).toString("utf8").split("\0");
  return output[2] || undefined;
}

gitBuffer(["rev-parse", "--verify", BASE]);
const changed = new Set(nulPaths(gitBuffer(["diff", "--name-only", "-z", BASE, "--"])));
for (const file of nulPaths(gitBuffer(["ls-files", "--others", "--exclude-standard", "-z"]))) changed.add(file);

const errors: string[] = [];
let binaryCount = 0;
let binaryBytes = 0;
let largest = { path: "", bytes: 0 };

for (const file of [...changed].sort()) {
  const absolute = path.join(ROOT, ...file.split("/"));
  let stat;
  try { stat = statSync(absolute); }
  catch { continue; } // A deletion cannot introduce an LFS object.
  if (!stat.isFile()) continue;

  const extension = path.extname(file).toLowerCase();
  const isBinary = BINARY_EXTENSIONS.has(extension);
  const attribute = checkAttribute(file);
  if (attribute === "lfs") errors.push("LFS-tracked future-main file: " + file);

  const prefix = readFileSync(absolute).subarray(0, LFS_POINTER.length).toString("utf8");
  if (prefix === LFS_POINTER) errors.push("LFS pointer blob or unavailable LFS object in future main: " + file);

  if (isBinary) {
    binaryCount++;
    binaryBytes += stat.size;
    if (stat.size > largest.bytes) largest = { path: file, bytes: stat.size };
    if (stat.size > MAX_BINARY_BYTES) {
      errors.push(
        "New/changed binary exceeds the reviewed 25 MB normal-Git ceiling (" +
        (stat.size / 1024 / 1024).toFixed(2) + " MB): " + file
      );
    }
  }
}

if (errors.length) {
  console.error("No-LFS verification failed with " + errors.length + " error(s):\n\n" + errors.join("\n"));
  process.exit(1);
}

console.log("No-LFS verification passed against " + BASE + ".");
console.log("  changed/new paths=" + changed.size);
console.log("  changed/new binaries=" + binaryCount + " (" + (binaryBytes / 1024 / 1024).toFixed(2) + " MB)");
console.log("  largest binary=" + (largest.path || "none") + (largest.path ? " (" + (largest.bytes / 1024 / 1024).toFixed(2) + " MB)" : ""));
console.log("  LFS attributes=0; LFS pointer blobs=0; unavailable future-tree LFS objects=0");
