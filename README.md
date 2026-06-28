# Auto Panda Motive

This repository contains the code for the *Auto Panda Motive* website, where I showcase my car projects.
It shares photos and stories for all my cars, both present (in "The Garage") and past (down "Memory Lane").
I built the site with [Astro](https://astro.build/) as a static site.

The site is hosted on GitHub Pages at: https://autopandamotive.com

Site photos live in a separate repository and are served through [jsDelivr](https://www.jsdelivr.com/):

- **Photos repository:** [AutomationPanda/auto-panda-motive-photos](https://github.com/AutomationPanda/auto-panda-motive-photos)
- **CDN base URL:** `https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/`


## Quickstart

[Node.js](https://nodejs.org/) 22.12+ is required.

```bash
# Running the app locally in dev mode
npm ci
npm run dev

# Building and running the static site
npm run build
npm run preview

# Installing Playwright browsers (one-time setup)
npx playwright install chromium

# Run Playwright tests
npm run test:e2e
```

The app runs locally at: [http://localhost:4321/](http://localhost:4321/)


## Development

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
│   └── images/             # Image assets
├── src/
│   ├── components/         # Astro UI components (Layout, CarCard, gallery, timeline)
│   ├── content/
│   │   ├── cars/           # One Markdown file per car
│   │   └── stories/        # Timeline entries in subfolders per car qrSlug
│   ├── pages/              # Routes (home, garage, memory lane, about, car pages)
│   ├── styles/             # Global CSS design tokens
│   └── utils/              # Helpers (image URLs, site base path)
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
| `heroImage` | Main photo (jsDelivr CDN URL) |
| `gallery` | List of gallery image CDN URLs |
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
heroImage: https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/1970-vw-beetle/hero.webp
gallery:
  - https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/1970-vw-beetle/engine.webp
qrSlug: 1970-vw-beetle
sortOrder: 1
---

Optional longer overview about this car.
```

### Stories (`src/content/stories/<qrSlug>/`)

One `.md` file per timeline entry, grouped in a subfolder named after the car's `qrSlug`.

```yaml
---
title: "Paint job complete"
date: 2024-06-15
images:
  - https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/1970-vw-beetle/paint-after.webp
videoUrl: https://www.youtube.com/watch?v=example
---

Story body: what you did, why, and how it turned out.
```

Stories appear on the car's page in chronological order. This site is not a blog: there is no site-wide feed, only per-car timelines.

### Images

Car and page photos are **not** stored in this repository. They live in
[auto-panda-motive-photos](https://github.com/AutomationPanda/auto-panda-motive-photos)
and are served through jsDelivr. Reference them with full CDN URLs in frontmatter:

```
https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/<filepath>
```

Typical paths:

| Asset | Path in photos repo |
|-------|---------------------|
| Car hero | `images/cars/<qrSlug>/hero.webp` |
| Car gallery | `images/cars/<qrSlug>/<name>.webp` |
| Home hero | `images/pages/home.jpeg` |
| About hero | `images/pages/about.webp` |

**Adding or updating a photo:**

1. Add or optimize the file in `auto-panda-motive-photos` (that repo includes an
   `images-to-webp.sh` script for WebP conversion)
2. Push to `main` on the photos repo (jsDelivr picks up changes after a short cache delay)
3. Set the full jsDelivr URL in car or story frontmatter in this repo
4. For hero images, add intrinsic width and height to `src/data/hero-dimensions.ts`
   so layout is reserved before the image decodes

`resolveImage()` in `src/utils/image.ts` passes CDN URLs through unchanged. Local
paths under `public/` still work for small structural assets such as the favicon
and logo.

Videos are never stored in git. Use `videoUrl` with a YouTube or Vimeo link.

### Publish content changes

1. Add or edit Markdown under `src/content/`
2. Add or update photos in `auto-panda-motive-photos`, then reference their jsDelivr URLs
3. Run `npm run dev` to preview
4. Commit and push to `main` on each repository as needed
5. GitHub Actions runs tests and deploys the site if they pass

Content is copyrighted (see `LICENSE`). Code is open source under MIT terms.

