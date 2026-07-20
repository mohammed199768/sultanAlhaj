import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp, { type OverlayOptions } from "sharp";
import SultanShadiMark, {
  type SultanShadiMarkVariant,
} from "../components/brand/SultanShadiMark";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const BRAND_DIR = path.join(ROOT, "public", "brand");
const NAVY = { r: 7, g: 23, b: 57, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

mkdirSync(BRAND_DIR, { recursive: true });

function svgMarkup(variant: SultanShadiMarkVariant) {
  return renderToStaticMarkup(
    <SultanShadiMark variant={variant} size={2048} decorative />
  );
}

async function trimmedMark(variant: SultanShadiMarkVariant) {
  return sharp(Buffer.from(svgMarkup(variant)))
    .png()
    .trim({ background: TRANSPARENT })
    .toBuffer();
}

async function placeMark({
  variant,
  width,
  height,
  padding,
  background,
  opticalShiftY = 0,
}: {
  variant: SultanShadiMarkVariant;
  width: number;
  height: number;
  padding: number;
  background: typeof NAVY | typeof TRANSPARENT;
  opticalShiftY?: number;
}) {
  const source = await trimmedMark(variant);
  const maxWidth = Math.max(1, Math.round(width * (1 - padding * 2)));
  const maxHeight = Math.max(1, Math.round(height * (1 - padding * 2)));
  const resized = await sharp(source)
    .resize({ width: maxWidth, height: maxHeight, fit: "inside" })
    .png()
    .toBuffer();
  const metadata = await sharp(resized).metadata();
  const markWidth = metadata.width ?? maxWidth;
  const markHeight = metadata.height ?? maxHeight;
  const left = Math.round((width - markWidth) / 2);
  const centeredTop = Math.round((height - markHeight) / 2);
  const top = Math.max(0, Math.min(height - markHeight, centeredTop + opticalShiftY));
  const overlay: OverlayOptions = { input: resized, left, top };

  const canvas = sharp({ create: { width, height, channels: 4, background } })
    .composite([overlay])
    .toColourspace("srgb");

  return background.alpha === 1 ? canvas.removeAlpha() : canvas;
}

async function pngBuffer(
  variant: SultanShadiMarkVariant,
  width: number,
  height: number,
  padding: number,
  background: typeof NAVY | typeof TRANSPARENT,
  opticalShiftY = 0
) {
  return (await placeMark({ variant, width, height, padding, background, opticalShiftY }))
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function icoBuffer(images: Array<{ size: number; png: Buffer }>) {
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * images.length;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

async function main() {
  const transparentPng = await pngBuffer(
    "monogram",
    1024,
    1024,
    0.12,
    TRANSPARENT,
    -12
  );
  writeFileSync(
    path.join(BRAND_DIR, "sultan-shadi-monogram-transparent.png"),
    transparentPng
  );
  await sharp(transparentPng)
    .webp({ lossless: true, quality: 100, alphaQuality: 100 })
    .toFile(path.join(BRAND_DIR, "sultan-shadi-monogram-transparent.webp"));

  const icon = await pngBuffer("monogram", 512, 512, 0.12, NAVY, -6);
  writeFileSync(path.join(APP_DIR, "icon.png"), icon);

  const appleIcon = await pngBuffer("monogram", 180, 180, 0.12, NAVY, -2);
  writeFileSync(path.join(APP_DIR, "apple-icon.png"), appleIcon);

  const faviconImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      png: await pngBuffer("monogram", size, size, 0.11, NAVY),
    }))
  );
  writeFileSync(path.join(APP_DIR, "favicon.ico"), icoBuffer(faviconImages));

  const share = await pngBuffer("full", 1200, 630, 0.095, NAVY);
  writeFileSync(path.join(BRAND_DIR, "sultan-shadi-share.png"), share);
  writeFileSync(path.join(APP_DIR, "opengraph-image.png"), share);
  writeFileSync(path.join(APP_DIR, "twitter-image.png"), share);

  console.log("Brand assets generated from components/brand/SultanShadiMark.tsx");
  console.log("  favicon.ico: 16x16, 32x32, 48x48 PNG entries");
  console.log("  icon.png: 512x512; apple-icon.png: 180x180");
  console.log("  Open Graph and Twitter images: 1200x630");
}

void main();
