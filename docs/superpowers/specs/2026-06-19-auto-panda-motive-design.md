# Auto Panda Motive — Design Spec

**Date:** 2026-06-19  
**Status:** Approved

## Overview

Auto Panda Motive is a personal website for showcasing hobby cars — stories, photos, and context for visitors at car shows who scan QR codes. It is not a blog, not commercial, and not monetized. The owner works on cool cars for the love of the game and wants to share that pride in a polished, photography-first way.

**Tech stack:** Astro (static output), raw CSS with custom properties, GitHub Pages, custom domain.

## Goals

- Showcase cars the owner currently holds and cars from the past with stories and photos
- Provide per-car URLs for QR codes at car shows (mobile-first car pages)
- Keep content management simple: edit Markdown files in the repo and push to publish
- Support flexible image hosting (in-repo or external CDN) per image
- Embed videos from YouTube/Vimeo — never store video files in git

## Non-Goals

- Blog-style posts or a site-wide stories feed
- CMS or admin UI
- Monetization, ads, or services
- User accounts or comments
- Committing raw video or unoptimized multi-MB originals to git by default

## Site Structure

### Top-level sections

| Section | URL | Contents |
|---------|-----|----------|
| Home | `/` | Intro blurb + grid of Garage cars + link to Memory Lane |
| The Garage | `/garage/` | Cars currently owned — finished, daily drivers, and forever projects alike |
| Memory Lane | `/memory-lane/` | Cars owned in the past but no longer in the collection |
| About | `/about/` | Owner, the hobby, why "Auto Panda Motive" |
| Car pages | `/cars/<slug>/` | Per-car showcase — QR code destination |

### Navigation

Home · The Garage · Memory Lane · About

The only categorical split is **ownership**: cars in The Garage vs cars in Memory Lane. There is no separate "in restoration" tier — work on owned cars never really ends, and restoration progress belongs in stories, not labels.

### Cars

| Car | Year | Section |
|-----|------|---------|
| Volkswagen Beetle | 1970 | The Garage |
| Mercedes-Benz C280 4MATIC | 2006 | The Garage |
| Volkswagen Bus | 1979 | The Garage |
| Volkswagen Karmann Ghia Convertible | 1974 | Memory Lane |
| Chrysler 300 | 2007 | Memory Lane |

### QR codes

Each car gets its own QR code linking directly to `/cars/<slug>/`. Example: `/cars/1970-vw-beetle/`.

## Page Designs

### Home

1. Short intro paragraph about the site and the hobby (not just photos without context)
2. Grid of car cards for all Garage cars (everything currently owned)
3. Link to Memory Lane

### The Garage / Memory Lane

Grid of car cards filtered by ownership section. Same card component as the homepage. Memory Lane cards may show a subtle "Memory Lane" label — not a status hierarchy, just orientation for visitors.

### Car page (QR destination, mobile-first)

Top to bottom:

1. **Hero photo** — full-width
2. **At-a-glance card** — year, make, model, one-line hook (above the fold on mobile). Memory Lane cars show a subtle section label; no "current vs restoration" badges.
3. **Photo gallery** — responsive grid with lightbox on click/tap
4. **Story timeline** — chronological entries with date, title, body, and inline photos

Optional: embedded YouTube/Vimeo video within a story entry.

### About

Short page about the owner, the car hobby, and the meaning behind "Auto Panda Motive". Linked from main navigation.

### 404

Custom page with link back to The Garage. Shown for unknown car slugs or missing routes.

## Visual Design System

**Direction:** Modern Gallery — black-and-white palette, photography-first, subtle panda accents.

### Colors (CSS custom properties)

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#ffffff` | Page background |
| `--color-bg-alt` | `#f5f5f5` | Card/section backgrounds |
| `--color-text` | `#1a1a1a` | Body text |
| `--color-text-muted` | `#666666` | Secondary text, dates |
| `--color-accent` | `#000000` | Headings, nav, borders |
| `--color-border` | `#e0e0e0` | Dividers, card edges |

Strict monochrome — photos provide all color.

### Typography

- **Headings:** clean sans-serif (system stack or Inter), light weight, generous letter-spacing
- **Body:** same family, regular weight, line-height ~1.6
- **Car names:** slightly larger, bold

### Panda branding (between minimal and subtle)

- Favicon: minimalist panda mark (black on white)
- Footer: small panda logo + "Auto Panda Motive" wordmark
- No panda imagery in content areas — cars remain hero

### Components

| Component | Behavior |
|-----------|----------|
| Car card | Photo top, name + hook below; optional subtle "Memory Lane" label on formerly-owned cars |
| At-a-glance card | Bordered card below hero — year, make, model, hook |
| Photo gallery | Responsive grid, lightbox on click/tap |
| Story timeline | Vertical line, date + title + body + inline photos per entry |
| Nav | Fixed top, black text on white, minimal |

### Styling approach

Raw CSS with custom properties — no Tailwind or CSS framework. Shared tokens and base styles in `src/styles/global.css`; component-scoped `<style>` blocks in `.astro` files.

## Content Model

**Approach:** Astro Content Collections with Zod schemas (Approach 1 from brainstorming).

### `cars` collection

One Markdown file per car. Frontmatter holds structured data; body is optional overview prose.

```yaml
---
name: "1970 Volkswagen Beetle"
year: 1970
make: Volkswagen
model: Beetle
section: garage          # garage | memory-lane
hook: "My first classic — fully restored over three summers."
heroImage: /images/cars/1970-vw-beetle/hero.jpg
gallery:
  - /images/cars/1970-vw-beetle/engine.jpg
  - https://media.example.com/beetle/interior.jpg
qrSlug: 1970-vw-beetle
sortOrder: 1
---
Optional longer overview paragraph about this car.
```

`section` is the only categorical field — it controls which listing page includes the car. Restoration progress, build milestones, and "where the project stands" live in story timeline entries, not in frontmatter labels.

### `stories` collection

One Markdown file per timeline entry, linked to a car by slug.

```yaml
---
title: "Paint job complete"
car: 1970-vw-beetle
date: 2024-06-15
images:
  - /images/cars/1970-vw-beetle/paint-before.jpg
  - https://media.example.com/beetle/paint-after.jpg
videoUrl: https://www.youtube.com/watch?v=example
---
Story body — what you did, why, how it turned out.
```

### Flexible image strategy

Frontmatter image fields accept **either** local paths or absolute CDN URLs. A small `resolveImage()` helper passes CDN URLs through unchanged and serves local paths from `public/`.

| Use in-repo when… | Use CDN when… |
|-------------------|---------------|
| Image is optimized (~200–500 KB) | Original is 2–5 MB and full quality is desired |
| One-off or prototyping | Many photos for one car |
| Zero external dependencies preferred | Fast repo clones matter |

**Always in-repo:** favicon, panda logo, small UI assets.  
**Always external embed:** videos (YouTube/Vimeo) — never commit video files.

### File layout

```
src/content/
  cars/
    1970-vw-beetle.md
    2006-mercedes-c280.md
    1979-vw-bus.md
    1974-karmann-ghia.md
    2007-chrysler-300.md
  stories/
    beetle-paint-job.md
    ...
public/
  images/cars/<car-slug>/   # optional local images
  favicon.svg
```

### Content workflow

1. Add photos locally under `public/images/cars/<slug>/` and/or upload to CDN and copy URLs
2. Create or edit `.md` files in `cars/` or `stories/`
3. Commit and push — GitHub Actions builds and deploys

## Technical Architecture

### Stack

| Layer | Choice |
|-------|--------|
| Framework | Astro (static output) |
| Styling | Raw CSS + custom properties |
| Hosting | GitHub Pages |
| Domain | Custom domain via GitHub Pages DNS |
| CI/CD | GitHub Actions on push to `main` |
| Content | Astro Content Collections |
| Images | Local paths or CDN URLs via `resolveImage()` |
| Videos | YouTube/Vimeo embeds |
| UI smoke tests | Playwright (minimal suite in CI) |

### URL structure

```
/                          → Home
/garage/                   → The Garage
/memory-lane/              → Memory Lane
/about/                    → About
/cars/1970-vw-beetle/
/cars/2006-mercedes-c280/
/cars/1979-vw-bus/
/cars/1974-karmann-ghia/
/cars/2007-chrysler-300/
```

### Astro config

```js
export default defineConfig({
  site: 'https://autopandamotive.com',  // set to actual domain at deploy time
  output: 'static',
});
```

`base: '/'` — site served at domain root, not a subpath.

### GitHub Pages deployment

- GitHub Actions: `npm ci` → `npm run build` → Playwright smoke tests → deploy `dist/` to Pages (deploy only if tests pass)
- Playwright runs against a local preview server (`astro preview` or static serve of `dist/`)
- Custom domain: DNS CNAME to `<username>.github.io`, plus `CNAME` file in repo

### Project structure

```
auto-panda-motive/
├── .github/workflows/deploy.yml
├── docs/superpowers/specs/
├── e2e/
│   └── smoke.spec.ts
├── playwright.config.ts
├── public/
│   ├── favicon.svg
│   ├── images/cars/
│   └── CNAME
├── src/
│   ├── content/
│   │   ├── cars/
│   │   └── stories/
│   ├── components/
│   │   ├── CarCard.astro
│   │   ├── AtAGlance.astro
│   │   ├── PhotoGallery.astro
│   │   ├── StoryTimeline.astro
│   │   └── Layout.astro
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── garage.astro
│   │   ├── memory-lane.astro
│   │   ├── about.astro
│   │   └── cars/[slug].astro
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       └── image.ts
├── astro.config.mjs
└── package.json
```

## Error Handling

- Unknown car slug at runtime → custom 404 with link to The Garage
- Story references unknown `car` slug → build-time Zod validation error
- Broken or missing image URL → show `alt` text and a graceful placeholder

## Testing

### Build gate (required)

- `npm run build` must pass with zero errors before every deploy
- Content validation via Astro/Zod schemas at build time (invalid car/story references fail the build)

### Playwright smoke tests (required in CI)

Minimal UI smoke suite — not exhaustive coverage. Run via `npm run test:e2e` after build, against a local preview server.

| Test | What it verifies |
|------|------------------|
| Home page | Loads, shows intro text and garage car cards |
| The Garage | `/garage/` returns 200, lists all currently owned cars |
| Memory Lane | `/memory-lane/` returns 200, lists formerly owned cars |
| Car pages | Each of the five car slugs returns 200 and displays the car name |
| About page | `/about/` returns 200 |
| 404 page | Unknown slug shows custom 404 with link back to The Garage |
| Mobile viewport | One car page renders at-a-glance card above the fold at phone width |

**Out of scope for v1:** visual regression (screenshot diffs), lightbox/timeline interaction tests, CDN image loading in CI, cross-browser matrix beyond Chromium.

### Manual checks (optional, pre-push)

- Gallery lightbox and timeline rendering via `npm run preview`
- Real device check of a QR-linked car page at a show (informal)

## MVP Launch Content

All five cars get a car page at launch (stories may be sparse initially):

| Car | Priority |
|-----|----------|
| 1970 VW Beetle | Must-have |
| 2006 Mercedes C280 | Must-have |
| 1979 VW Bus | Must-have |
| 1974 Karmann Ghia | Must-have |
| 2007 Chrysler 300 | Must-have |

About page may ship with placeholder copy and be refined post-launch.
