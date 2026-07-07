# Sultan Shadi — Portfolio Website

A cinematic, editorial marketing-strategist portfolio built with **Next.js (App Router) + TypeScript + Tailwind CSS**, with smooth scroll (Lenis), GSAP + Framer Motion, and a dynamic portfolio generated from the `/public` asset folders.

## Requirements
- **Node.js 18 or 20 LTS** recommended (works with 22 as well).
- npm.

## Getting started
```bash
npm install
npm run dev        # http://localhost:3000
```

## Build
```bash
npm run build      # runs generate:manifest first, then next build
npm start          # serve the production build
```

## Asset manifest (dynamic portfolio)
The gallery, case studies and testimonials are generated from `/public`:
- `public/portfolio/<Client>/…` — brand folders (images / videos / PDFs)
- `public/works/` — curated gallery images
- `public/reels/` — vertical testimonial screenshots
- `public/clients/Inkspire clients logo/` — client logos

Regenerate the manifest any time you add or change assets:
```bash
npm run generate:manifest
```
This scans the folders, skips OS junk, extracts image sizes, and writes
`lib/manifest/portfolio.generated.json`.

### Editing the portfolio mapping
Folder → client name / category / summary lives in **one file**:
`lib/data/portfolioMeta.ts`. Correct any entry there.

### Case studies
`lib/data/caseStudies.ts` holds the editorial case-study shells. When a case
study's `folderKey` matches a `public/portfolio` folder, its media is used
automatically; otherwise a polished "in production" shell renders.

## Video transcoding
Browsers can't play `.mov`. A helper transcodes them to web-safe `.mp4` + poster:
```bash
npm run transcode   # requires ffmpeg on PATH; skips files already done
```
All current `.mov` files have already been transcoded. Re-run after adding new ones,
then `npm run generate:manifest`.

## Content
All copy, experience, capabilities, tools, results and contact details live in
typed files under `lib/data/`. Update text there — no component edits needed.

## Notes
- `@next/swc-wasm-nodejs` is included as a build fallback; native SWC is used
  automatically when supported.
- Respects `prefers-reduced-motion`; motion is disabled for those users.
