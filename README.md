# Auto Panda Motive

A personal website for showcasing hobby cars: stories, photos, and context for visitors at car shows who scan QR codes. Built with [Astro](https://astro.build/) as a static site and deployed to GitHub Pages.

**The Garage** lists cars currently owned. **Memory Lane** holds cars from the past. Each car has its own page with a photo gallery and story timeline.

## Requirements

- [Node.js](https://nodejs.org/) 22.12 or later

## Install

```bash
git clone https://github.com/AutomationPanda/auto-panda-motive.git
cd auto-panda-motive
npm ci
```

Install Playwright browsers (first time only, needed for tests):

```bash
npx playwright install chromium
```

## Run locally

Start the development server with hot reload:

```bash
npm run dev
```

Open [http://localhost:4321/auto-panda-motive/](http://localhost:4321/auto-panda-motive/).

Build the static site and preview the production output:

```bash
npm run build
npm run preview
```

Preview at [http://localhost:4321/auto-panda-motive/](http://localhost:4321/auto-panda-motive/).

## Deploy

The site publishes to GitHub Pages at:

**https://automationpanda.github.io/auto-panda-motive/**

Enable GitHub Pages in repo Settings (Source: GitHub Actions), then push to `main`.

When you register a custom domain later, update `astro.config.mjs` (`site` and `base: "/"`), add `public/CNAME`, and configure DNS.

## Tests

Run the Playwright smoke test suite (builds are tested against the preview server automatically):

```bash
npm run test:e2e
```

Run a production build first if you have not built recently:

```bash
npm run build && npm run test:e2e
```

## Development workflow

This project is built and maintained with [Cursor](https://cursor.com/) and the [Superpowers](https://github.com/cursor/plugins) plugin. Superpowers provides structured skills for brainstorming, planning, test-driven development, and verification rather than ad hoc coding.

Typical flow for a new feature or change:

1. **Brainstorm** (`/brainstorming`): clarify requirements and design before writing code
2. **Write plan**: save an implementation plan to `docs/superpowers/plans/`
3. **Implement**: execute the plan task by task (often in a git worktree on a feature branch)
4. **Verify**: run `npm run build` and `npm run test:e2e` before merging
5. **Deploy**: merge to `main`; GitHub Actions builds, tests, and publishes to GitHub Pages

Design decisions and specs live under `docs/superpowers/specs/`. Project rules for the AI agent (for example, prose style) live in `.cursor/rules/`.

## Project structure

```
auto-panda-motive/
├── .cursor/rules/          # Cursor agent rules for this repo
├── .github/workflows/      # CI: build, Playwright tests, GitHub Pages deploy
├── docs/superpowers/       # Design specs and implementation plans
├── e2e/                    # Playwright smoke tests
├── public/                 # Static assets served as-is
│   ├── favicon.svg
│   └── images/cars/        # Local car photos (optional; CDN URLs also supported)
├── src/
│   ├── components/         # Astro UI components (Layout, CarCard, gallery, timeline)
│   ├── content/
│   │   ├── cars/           # One Markdown file per car
│   │   └── stories/        # Timeline entries linked to a car by slug
│   ├── pages/              # Routes (home, garage, memory lane, about, car pages)
│   ├── styles/             # Global CSS design tokens
│   └── utils/              # Helpers (image URLs, base path for GitHub Pages)
├── astro.config.mjs        # Astro site URL and base path
├── playwright.config.ts
└── LICENSE                 # Dual license: open source code, reserved content
```

## Content

All site copy, car metadata, and timeline entries are Markdown files validated by Astro content collections (`src/content.config.ts`). There is no CMS: edit files locally, commit, and push to publish.

### Cars (`src/content/cars/`)

One `.md` file per car. Frontmatter holds structured data; the body is an optional overview paragraph.

| Field | Purpose |
|-------|---------|
| `name`, `year`, `make`, `model` | Display name and specs |
| `section` | `garage` (currently owned) or `memory-lane` (past cars) |
| `hook` | One-line summary for cards and the at-a-glance block |
| `heroImage` | Main photo (local path or CDN URL) |
| `gallery` | List of gallery image paths or URLs |
| `qrSlug` | URL slug, e.g. `1970-vw-beetle` → `/cars/1970-vw-beetle/` |
| `sortOrder` | Order on listing pages |

Example:

```yaml
---
name: "1970 Volkswagen Beetle"
year: 1970
make: Volkswagen
model: Beetle
section: garage
hook: "My first classic, a lifelong project that never really ends."
heroImage: /images/cars/1970-vw-beetle/hero.jpg
gallery:
  - /images/cars/1970-vw-beetle/engine.jpg
  - https://media.example.com/beetle/interior.jpg
qrSlug: 1970-vw-beetle
sortOrder: 1
---

Optional longer overview about this car.
```

### Stories (`src/content/stories/`)

One `.md` file per timeline entry. Linked to a car via `car` (must match that car's `qrSlug`).

```yaml
---
title: "Paint job complete"
car: 1970-vw-beetle
date: 2024-06-15
images:
  - /images/cars/1970-vw-beetle/paint-after.jpg
videoUrl: https://www.youtube.com/watch?v=example
---

Story body: what you did, why, and how it turned out.
```

Stories appear on the car's page in chronological order. This site is not a blog: there is no site-wide feed, only per-car timelines.

### Images

Images can live in the repo or on an external CDN:

- **In repo:** place files under `public/images/cars/<qrSlug>/` and reference them as `/images/cars/<qrSlug>/filename.jpg`
- **CDN:** use a full `https://` URL in frontmatter

Videos are never stored in git. Use `videoUrl` with a YouTube or Vimeo link.

### Publish content changes

1. Add or edit Markdown under `src/content/`
2. Add or optimize images locally and/or upload to your CDN
3. Run `npm run dev` to preview
4. Commit and push to `main`
5. GitHub Actions runs tests and deploys if they pass

Content is copyrighted (see `LICENSE`). Code is open source under MIT terms.

