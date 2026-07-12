# Content editing guide

All editable portfolio content lives in `content/`. Application behavior, layouts, animation, and the section registry remain in TypeScript.

## Add or edit a project

Create one file at `content/projects/project-slug.json`; the filename should match `slug`. Copy the example below, use a unique integer `order`, and run `npm run validate:content`. A project asset folder is optional for previews and must exactly match a folder under `public/portfolio` when supplied.

The same file controls the Work card (`card`), popup (`popup`), case-study hero and sections (`hero`, `sections`), SEO (`metadata`), services, metrics, related projects, visibility, and ordering. Asset-folder media is indexed automatically; do not list every scanned image manually.

Statuses:

- `published`: appears in Work when it has an `assetFolder` and gets a public `/work/[slug]` route.
- `preview`: may be selected in `content/home.json`, shows “Case study coming soon,” and gets no route.
- `draft`: does not appear publicly and gets no route or sitemap entry.

`featured` controls featured selectors. `order` controls the Work order. `content/home.json > caseStudies.projectSlugs` controls the separate Home case-study selection and order.

## Supported sections

- `text`: accepts `eyebrow`, `title`, and a `body` array.
- `gallery`: renders media from `assetFolder` and accepts an optional `title`.
- `metrics`: renders project `metrics`, or section-level `items`.
- `services`: renders the project `services` list.

Optional or empty sections render no wrapper. A genuinely new visual section requires one React component and one typed entry in `components/case-studies/ProjectSections.tsx`; JSON never contains JSX, HTML, import paths, or executable code.

## Global content

- `content/site.json`: brand name, default SEO, social image, header CTA, footer copy.
- `content/navigation.json`: primary navigation labels, destinations, and indexes.
- `content/profile.json`: canonical identity, role, company, biography, location, contact details, education, and languages.
- `content/cv.json`: CV-only collections, experience, skills, tools, selected value, labels, and CV metadata. Shared identity, education, languages, and contact facts come from `profile.json`.
- `content/contact.json`: Contact metadata and presentation labels.
- `content/home.json`: hero beats and mobile labels, capability cards, section headings, results, tool groups, Home contact CTA, Work copy, and case-study selection.

Asset paths start at `/public`, for example `/portfolio/client/image.webp` becomes `/portfolio/client/image.webp`. Spaces and non-ASCII characters may be written normally in editable JSON; the generated manifest URL-encodes browser paths.

## Example project

```json
{
  "schemaVersion": 1,
  "slug": "example-project",
  "status": "published",
  "featured": true,
  "order": 20,
  "assetFolder": "Example Project",
  "layout": "gallery",
  "summary": "A short summary shared by the Work card, popup, and default SEO.",
  "description": "A factual case-study introduction.",
  "identity": {
    "title": "Example Project",
    "shortTitle": "Example",
    "client": "Example Client",
    "category": "Full Branding",
    "year": "2026",
    "location": "Riyadh, Saudi Arabia"
  },
  "card": {
    "eyebrow": "Full Branding",
    "imageAlt": "Example project campaign cover"
  },
  "popup": {
    "ctaLabel": "Open full case study"
  },
  "hero": {
    "eyebrow": "Case Study",
    "imageAlt": "Example project case study"
  },
  "metadata": {
    "description": "Example Project case study."
  },
  "services": ["Brand Strategy", "Content"],
  "tools": [],
  "metrics": [],
  "sections": [
    { "id": "overview", "type": "text", "title": "Overview", "body": ["A factual paragraph."] },
    { "id": "gallery", "type": "gallery", "title": "Selected work" }
  ],
  "relatedProjects": []
}
```

## Commands and generated files

Run:

```sh
npm run validate:content
npm run generate:manifest
npx tsc --noEmit
npm run build
```

`lib/manifest/portfolio.generated.json` is deterministic generated output from assets and must not be edited manually. `npm run generate:manifest` uses the same project validation boundary as `validate:content`; `npm run build` validates content before regenerating the manifest.
