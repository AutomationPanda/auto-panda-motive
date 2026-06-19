# Auto Panda Motive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro site showcasing five hobby cars with per-car QR pages, Garage/Memory Lane sections, story timelines, and Playwright smoke tests deployed to GitHub Pages.

**Architecture:** Astro content collections (`cars`, `stories`) drive all pages. Components render from collection data; `resolveImage()` handles local vs CDN URLs. Raw CSS custom properties for the Modern Gallery black-and-white theme. Playwright smoke tests gate CI deploys.

**Tech Stack:** Astro (static), TypeScript, raw CSS, Astro Content Collections + Zod, Playwright, GitHub Actions, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-06-19-auto-panda-motive-design.md`

---

## File Map

| File | Responsibility |
|------|----------------|
| `astro.config.mjs` | Static output, site URL |
| `src/content.config.ts` | Zod schemas for `cars` and `stories` collections |
| `src/utils/image.ts` | Resolve local paths vs CDN URLs |
| `src/styles/global.css` | Design tokens, reset, typography, layout utilities |
| `src/components/Layout.astro` | Shell: nav, footer, panda branding, global CSS import |
| `src/components/CarCard.astro` | Card for listing grids |
| `src/components/AtAGlance.astro` | Car page summary card |
| `src/components/PhotoGallery.astro` | Image grid + lightbox |
| `src/components/StoryTimeline.astro` | Chronological story entries |
| `src/pages/index.astro` | Home: intro + garage grid + Memory Lane link |
| `src/pages/garage.astro` | All `section: garage` cars |
| `src/pages/memory-lane.astro` | All `section: memory-lane` cars |
| `src/pages/about.astro` | About page |
| `src/pages/cars/[slug].astro` | Per-car QR destination |
| `src/pages/404.astro` | Custom not-found page |
| `src/content/cars/*.md` | Five car definitions |
| `src/content/stories/*.md` | Sample timeline entries |
| `public/favicon.svg` | Minimal panda favicon |
| `public/images/cars/<slug>/placeholder.svg` | Placeholder hero per car |
| `playwright.config.ts` | E2E config with preview webServer |
| `e2e/smoke.spec.ts` | Smoke test suite |
| `.github/workflows/deploy.yml` | Build, test, deploy pipeline |

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Initialize Astro in the existing repo**

Run from repo root:

```bash
npm create astro@latest . -- --template minimal --typescript strict --install --git false --yes
```

Expected: Astro scaffolds into the existing directory without overwriting `README.md`.

- [ ] **Step 2: Add `.superpowers/` to gitignore**

Append to `.gitignore`:

```
.superpowers/
```

- [ ] **Step 3: Configure static output and site URL**

Replace `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://autopandamotive.com",
  output: "static",
});
```

- [ ] **Step 4: Verify build**

Run: `npm run build`  
Expected: PASS — empty site builds to `dist/`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/ .gitignore
git commit -m "chore: scaffold Astro static site"
```

---

### Task 2: Global CSS design system

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create global styles**

Create `src/styles/global.css`:

```css
:root {
  --color-bg: #ffffff;
  --color-bg-alt: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-muted: #666666;
  --color-accent: #000000;
  --color-border: #e0e0e0;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --max-width: 1100px;
  --nav-height: 3.5rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

h1,
h2,
h3 {
  font-weight: 300;
  letter-spacing: 0.04em;
  color: var(--color-accent);
}

a {
  color: var(--color-accent);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

.container {
  width: min(100% - 2rem, var(--max-width));
  margin-inline: auto;
}

.section-label {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.car-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add global CSS design tokens"
```

---

### Task 3: Content collections and schemas

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/cars/` (five files)
- Create: `src/content/stories/` (two sample files)

- [ ] **Step 1: Define collection schemas**

Create `src/content.config.ts`:

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const cars = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cars" }),
  schema: z.object({
    name: z.string(),
    year: z.number(),
    make: z.string(),
    model: z.string(),
    section: z.enum(["garage", "memory-lane"]),
    hook: z.string(),
    heroImage: z.string(),
    gallery: z.array(z.string()).default([]),
    qrSlug: z.string(),
    sortOrder: z.number(),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/stories" }),
  schema: z.object({
    title: z.string(),
    car: z.string(),
    date: z.coerce.date(),
    images: z.array(z.string()).default([]),
    videoUrl: z.string().url().optional(),
  }),
});

export const collections = { cars, stories };
```

- [ ] **Step 2: Create placeholder SVG helper content**

Create `public/images/cars/1970-vw-beetle/placeholder.svg` (repeat for each slug):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#f5f5f5"/>
  <text x="400" y="250" text-anchor="middle" fill="#666" font-family="system-ui,sans-serif" font-size="24">1970 VW Beetle</text>
</svg>
```

Create matching placeholders for: `2006-mercedes-c280`, `1979-vw-bus`, `1974-karmann-ghia`, `2007-chrysler-300`.

- [ ] **Step 3: Create car content files**

Create `src/content/cars/1970-vw-beetle.md`:

```markdown
---
name: "1970 Volkswagen Beetle"
year: 1970
make: Volkswagen
model: Beetle
section: garage
hook: "My first classic — a lifelong project that never really ends."
heroImage: /images/cars/1970-vw-beetle/placeholder.svg
gallery: []
qrSlug: 1970-vw-beetle
sortOrder: 1
---

The Beetle that started it all.
```

Create `src/content/cars/2006-mercedes-c280.md`:

```markdown
---
name: "2006 Mercedes-Benz C280 4MATIC"
year: 2006
make: Mercedes-Benz
model: C280 4MATIC
section: garage
hook: "Daily refinement — comfort meets all-wheel drive."
heroImage: /images/cars/2006-mercedes-c280/placeholder.svg
gallery: []
qrSlug: 2006-mercedes-c280
sortOrder: 2
---
```

Create `src/content/cars/1979-vw-bus.md`:

```markdown
---
name: "1979 Volkswagen Bus"
year: 1979
make: Volkswagen
model: Bus
section: garage
hook: "The long game — a restoration with stories still being written."
heroImage: /images/cars/1979-vw-bus/placeholder.svg
gallery: []
qrSlug: 1979-vw-bus
sortOrder: 3
---
```

Create `src/content/cars/1974-karmann-ghia.md`:

```markdown
---
name: "1974 Volkswagen Karmann Ghia Convertible"
year: 1974
make: Volkswagen
model: "Karmann Ghia Convertible"
section: memory-lane
hook: "A convertible chapter since closed — still fondly remembered."
heroImage: /images/cars/1974-karmann-ghia/placeholder.svg
gallery: []
qrSlug: 1974-karmann-ghia
sortOrder: 4
---
```

Create `src/content/cars/2007-chrysler-300.md`:

```markdown
---
name: "2007 Chrysler 300"
year: 2007
make: Chrysler
model: "300"
section: memory-lane
hook: "A past chapter in the collection."
heroImage: /images/cars/2007-chrysler-300/placeholder.svg
gallery: []
qrSlug: 2007-chrysler-300
sortOrder: 5
---
```

- [ ] **Step 4: Create sample story entries**

Create `src/content/stories/beetle-first-drive.md`:

```markdown
---
title: "First drive after assembly"
car: 1970-vw-beetle
date: 2023-08-12
images: []
---

Finally turned the key and rolled out of the driveway. Nothing perfect — everything earned.
```

Create `src/content/stories/bus-engine-pull.md`:

```markdown
---
title: "Engine pull day"
car: 1979-vw-bus
date: 2024-03-20
images: []
---

Pulled the engine today. The project gets real when the bay is empty.
```

- [ ] **Step 5: Verify build validates content**

Run: `npm run build`  
Expected: PASS — five cars and two stories compile

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/ public/images/
git commit -m "feat: add content collections with five cars and sample stories"
```

---

### Task 4: Image utility

**Files:**
- Create: `src/utils/image.ts`

- [ ] **Step 1: Implement resolveImage**

Create `src/utils/image.ts`:

```ts
export function resolveImage(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return src.startsWith("/") ? src : `/${src}`;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/image.ts
git commit -m "feat: add resolveImage utility for local and CDN paths"
```

---

### Task 5: Layout shell with navigation

**Files:**
- Create: `src/components/Layout.astro`
- Create: `public/favicon.svg`
- Modify: `src/pages/index.astro` (temporary stub using Layout)

- [ ] **Step 1: Create favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#fff"/>
  <circle cx="11" cy="14" r="2.5" fill="#000"/>
  <circle cx="21" cy="14" r="2.5" fill="#000"/>
  <ellipse cx="16" cy="20" rx="5" ry="4" fill="#000"/>
  <ellipse cx="16" cy="18" rx="3" ry="2" fill="#fff"/>
</svg>
```

- [ ] **Step 2: Create Layout component**

Create `src/components/Layout.astro`:

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description = "Stories and pictures from the Auto Panda Motive garage." } = Astro.props;
const siteName = "Auto Panda Motive";
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title === siteName ? title : `${title} · ${siteName}`}</title>
  </head>
  <body>
    <header class="site-header">
      <nav class="container nav">
        <a class="logo" href="/">{siteName}</a>
        <div class="nav-links">
          <a href="/">Home</a>
          <a href="/garage/">The Garage</a>
          <a href="/memory-lane/">Memory Lane</a>
          <a href="/about/">About</a>
        </div>
      </nav>
    </header>
    <main>
      <slot />
    </main>
    <footer class="site-footer">
      <div class="container footer-inner">
        <img src="/favicon.svg" alt="" width="24" height="24" />
        <span>{siteName}</span>
      </div>
    </footer>
  </body>
</html>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    height: var(--nav-height);
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--nav-height);
  }

  .logo {
    font-weight: 600;
    letter-spacing: 0.06em;
    text-decoration: none;
    color: var(--color-accent);
  }

  .nav-links {
    display: flex;
    gap: 1.25rem;
  }

  .nav-links a {
    text-decoration: none;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
  }

  .nav-links a:hover {
    text-decoration: underline;
  }

  .site-footer {
    margin-top: 4rem;
    padding: 2rem 0;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .footer-inner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
```

- [ ] **Step 3: Stub index page with Layout**

Replace `src/pages/index.astro`:

```astro
---
import Layout from "../components/Layout.astro";
---

<Layout title="Auto Panda Motive">
  <div class="container">
    <h1>Auto Panda Motive</h1>
  </div>
</Layout>
```

- [ ] **Step 4: Verify dev and build**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout.astro public/favicon.svg src/pages/index.astro
git commit -m "feat: add Layout shell with nav and footer"
```

---

### Task 6: CarCard component and listing pages

**Files:**
- Create: `src/components/CarCard.astro`
- Create: `src/pages/garage.astro`
- Create: `src/pages/memory-lane.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create CarCard**

Create `src/components/CarCard.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";
import { resolveImage } from "../utils/image";

interface Props {
  car: CollectionEntry<"cars">;
}

const { car } = Astro.props;
const { name, hook, heroImage, qrSlug, section } = car.data;
---

<a class="car-card" href={`/cars/${qrSlug}/`}>
  <img src={resolveImage(heroImage)} alt={name} loading="lazy" />
  <div class="car-card-body">
    {section === "memory-lane" && <span class="section-label">Memory Lane</span>}
    <h3>{name}</h3>
    <p>{hook}</p>
  </div>
</a>

<style>
  .car-card {
    display: block;
    text-decoration: none;
    color: inherit;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    transition: border-color 0.15s ease;
  }

  .car-card:hover {
    border-color: var(--color-accent);
  }

  .car-card img {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    background: var(--color-bg-alt);
  }

  .car-card-body {
    padding: 1rem;
  }

  .car-card-body h3 {
    margin: 0.25rem 0;
    font-weight: 600;
  }

  .car-card-body p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
</style>
```

- [ ] **Step 2: Create garage and memory-lane pages**

Create `src/pages/garage.astro`:

```astro
---
import { getCollection } from "astro:content";
import Layout from "../components/Layout.astro";
import CarCard from "../components/CarCard.astro";

const cars = (await getCollection("cars"))
  .filter((car) => car.data.section === "garage")
  .sort((a, b) => a.data.sortOrder - b.data.sortOrder);
---

<Layout title="The Garage" description="Cars currently in the Auto Panda Motive collection.">
  <div class="container page">
    <h1>The Garage</h1>
    <p class="intro">Cars I currently own — finished, daily drivers, and forever projects alike.</p>
    <div class="car-grid">
      {cars.map((car) => <CarCard car={car} />)}
    </div>
  </div>
</Layout>

<style>
  .page {
    padding: 2rem 0;
  }

  .intro {
    color: var(--color-text-muted);
    max-width: 40rem;
  }
</style>
```

Create `src/pages/memory-lane.astro`:

```astro
---
import { getCollection } from "astro:content";
import Layout from "../components/Layout.astro";
import CarCard from "../components/CarCard.astro";

const cars = (await getCollection("cars"))
  .filter((car) => car.data.section === "memory-lane")
  .sort((a, b) => a.data.sortOrder - b.data.sortOrder);
---

<Layout title="Memory Lane" description="Cars from the past in the Auto Panda Motive collection.">
  <div class="container page">
    <h1>Memory Lane</h1>
    <p class="intro">Cars I owned in the past but no longer hold in the collection.</p>
    <div class="car-grid">
      {cars.map((car) => <CarCard car={car} />)}
    </div>
  </div>
</Layout>

<style>
  .page {
    padding: 2rem 0;
  }

  .intro {
    color: var(--color-text-muted);
    max-width: 40rem;
  }
</style>
```

- [ ] **Step 3: Update home page**

Replace `src/pages/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import Layout from "../components/Layout.astro";
import CarCard from "../components/CarCard.astro";

const garageCars = (await getCollection("cars"))
  .filter((car) => car.data.section === "garage")
  .sort((a, b) => a.data.sortOrder - b.data.sortOrder);
---

<Layout title="Auto Panda Motive">
  <div class="container page">
    <h1>Auto Panda Motive</h1>
    <p class="intro">
      A personal garage for the cars I love — stories, photos, and the work that never really ends.
      Scan a QR code at a show to learn more about a specific car.
    </p>
    <h2>The Garage</h2>
    <div class="car-grid">
      {garageCars.map((car) => <CarCard car={car} />)}
    </div>
    <p class="memory-link"><a href="/memory-lane/">Visit Memory Lane →</a></p>
  </div>
</Layout>

<style>
  .page {
    padding: 2rem 0;
  }

  .intro {
    color: var(--color-text-muted);
    max-width: 40rem;
    margin-bottom: 2rem;
  }

  .memory-link {
    margin-top: 2.5rem;
  }
</style>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`  
Expected: PASS — `/`, `/garage/`, `/memory-lane/` generated

- [ ] **Step 5: Commit**

```bash
git add src/components/CarCard.astro src/pages/
git commit -m "feat: add CarCard and listing pages"
```

---

### Task 7: Car detail page components

**Files:**
- Create: `src/components/AtAGlance.astro`
- Create: `src/components/PhotoGallery.astro`
- Create: `src/components/StoryTimeline.astro`
- Create: `src/pages/cars/[slug].astro`

- [ ] **Step 1: Create AtAGlance**

Create `src/components/AtAGlance.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  car: CollectionEntry<"cars">;
}

const { car } = Astro.props;
const { year, make, model, hook, section } = car.data;
---

<section class="at-a-glance">
  {section === "memory-lane" && <span class="section-label">Memory Lane</span>}
  <h1>{car.data.name}</h1>
  <p class="meta">{year} {make} {model}</p>
  <p class="hook">{hook}</p>
</section>

<style>
  .at-a-glance {
    border: 1px solid var(--color-border);
    padding: 1.25rem;
    background: var(--color-bg);
  }

  .at-a-glance h1 {
    margin: 0.25rem 0;
    font-weight: 600;
    font-size: 1.5rem;
  }

  .meta {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.95rem;
  }

  .hook {
    margin: 0.75rem 0 0;
  }
</style>
```

- [ ] **Step 2: Create PhotoGallery with lightbox**

Create `src/components/PhotoGallery.astro`:

```astro
---
import { resolveImage } from "../utils/image";

interface Props {
  images: string[];
  alt: string;
}

const { images, alt } = Astro.props;
---

{images.length > 0 && (
  <section class="gallery-section">
    <h2>Gallery</h2>
    <div class="gallery" data-gallery>
      {images.map((src, index) => (
        <button type="button" class="gallery-item" data-index={index} aria-label={`Open image ${index + 1}`}>
          <img src={resolveImage(src)} alt={`${alt} — photo ${index + 1}`} loading="lazy" />
        </button>
      ))}
    </div>
    <dialog class="lightbox" data-lightbox>
      <button type="button" class="lightbox-close" data-close aria-label="Close">×</button>
      <img src="" alt="" data-lightbox-image />
    </dialog>
  </section>
)}

<script>
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const dialog = gallery.parentElement?.querySelector("[data-lightbox]") as HTMLDialogElement | null;
    const lightboxImage = dialog?.querySelector("[data-lightbox-image]") as HTMLImageElement | null;
    if (!dialog || !lightboxImage) return;

    gallery.querySelectorAll(".gallery-item").forEach((button) => {
      button.addEventListener("click", () => {
        const img = button.querySelector("img");
        if (!img) return;
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        dialog.showModal();
      });
    });

    dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
</script>

<style>
  .gallery-section h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .gallery-item {
    padding: 0;
    border: 1px solid var(--color-border);
    background: var(--color-bg-alt);
    cursor: pointer;
  }

  .gallery-item img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  .lightbox {
    border: none;
    padding: 0;
    max-width: 95vw;
    max-height: 95vh;
    background: transparent;
  }

  .lightbox::backdrop {
    background: rgba(0, 0, 0, 0.85);
  }

  .lightbox img {
    max-width: 90vw;
    max-height: 85vh;
    margin: auto;
  }

  .lightbox-close {
    position: fixed;
    top: 1rem;
    right: 1rem;
    font-size: 2rem;
    color: #fff;
    background: transparent;
    border: none;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 3: Create StoryTimeline**

Create `src/components/StoryTimeline.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";
import { resolveImage } from "../utils/image";

interface Props {
  stories: CollectionEntry<"stories">[];
}

const { stories } = Astro.props;

function embedVideoUrl(url: string): string | null {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}
---

<section class="timeline-section">
  <h2>Story Timeline</h2>
  {stories.length === 0 ? (
    <p class="empty">Stories coming soon.</p>
  ) : (
    <ol class="timeline">
      {stories.map((story) => {
        const embed = story.data.videoUrl ? embedVideoUrl(story.data.videoUrl) : null;
        return (
          <li class="timeline-entry">
            <time datetime={story.data.date.toISOString()}>{story.data.date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
            <h3>{story.data.title}</h3>
            <div class="content"><story.render /></div>
            {story.data.images.length > 0 && (
              <div class="entry-images">
                {story.data.images.map((src) => (
                  <img src={resolveImage(src)} alt="" loading="lazy" />
                ))}
              </div>
            )}
            {embed && (
              <div class="video-embed">
                <iframe src={embed} title={story.data.title} allowfullscreen loading="lazy" />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  )}
</section>

<style>
  .timeline-section h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .empty {
    color: var(--color-text-muted);
  }

  .timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 2px solid var(--color-border);
  }

  .timeline-entry {
    padding: 0 0 2rem 1.25rem;
    position: relative;
  }

  .timeline-entry::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 0.35rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-accent);
  }

  .timeline-entry time {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .timeline-entry h3 {
    margin: 0.25rem 0 0.5rem;
    font-size: 1.05rem;
    font-weight: 600;
  }

  .entry-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .video-embed {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    margin-top: 0.75rem;
  }

  .video-embed iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
```

- [ ] **Step 4: Create car detail page**

Create `src/pages/cars/[slug].astro`:

```astro
---
import { getCollection, getEntry, render } from "astro:content";
import Layout from "../../components/Layout.astro";
import AtAGlance from "../../components/AtAGlance.astro";
import PhotoGallery from "../../components/PhotoGallery.astro";
import StoryTimeline from "../../components/StoryTimeline.astro";
import { resolveImage } from "../../utils/image";

export async function getStaticPaths() {
  const cars = await getCollection("cars");
  return cars.map((car) => ({
    params: { slug: car.data.qrSlug },
    props: { car },
  }));
}

const { car } = Astro.props;
const allStories = await getCollection("stories");
const carStories = allStories
  .filter((story) => story.data.car === car.data.qrSlug)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const { Content } = await render(car);
---

<Layout title={car.data.name} description={car.data.hook}>
  <article class="car-page">
    <img class="hero" src={resolveImage(car.data.heroImage)} alt={car.data.name} />
    <div class="container content">
      <AtAGlance car={car} />
      {car.body && (
        <div class="overview">
          <Content />
        </div>
      )}
      <PhotoGallery images={car.data.gallery} alt={car.data.name} />
      <StoryTimeline stories={carStories} />
    </div>
  </article>
</Layout>

<style>
  .hero {
    width: 100%;
    max-height: 60vh;
    object-fit: cover;
    background: var(--color-bg-alt);
  }

  .content {
    padding: 1.25rem 0 3rem;
    display: grid;
    gap: 2rem;
  }

  .overview {
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 5: Verify build generates all five car pages**

Run: `npm run build`  
Expected: PASS — routes for all five slugs in `dist/cars/`

- [ ] **Step 6: Commit**

```bash
git add src/components/AtAGlance.astro src/components/PhotoGallery.astro src/components/StoryTimeline.astro src/pages/cars/
git commit -m "feat: add car detail page with gallery and story timeline"
```

---

### Task 8: About and 404 pages

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create About page**

Create `src/pages/about.astro`:

```astro
---
import Layout from "../components/Layout.astro";
---

<Layout title="About" description="About Auto Panda Motive and the car hobby.">
  <div class="container page">
    <h1>About</h1>
    <p>
      Auto Panda Motive is a personal site for the cars I work on as a hobby — not a business,
      not a blog, just a place to share stories and photos for anyone curious enough to scan a QR code at a show.
    </p>
    <p>
      The panda? It’s a nickname, a spirit of playful persistence, and a reminder that the work is supposed to be fun.
    </p>
  </div>
</Layout>

<style>
  .page {
    padding: 2rem 0;
    max-width: 40rem;
  }
</style>
```

- [ ] **Step 2: Create 404 page**

Create `src/pages/404.astro`:

```astro
---
import Layout from "../components/Layout.astro";
---

<Layout title="Page not found">
  <div class="container page">
    <h1>Page not found</h1>
    <p>That route doesn’t exist. Maybe try a car in The Garage instead.</p>
    <p><a href="/garage/">Go to The Garage →</a></p>
  </div>
</Layout>

<style>
  .page {
    padding: 3rem 0;
  }
</style>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`  
Expected: PASS — `dist/about/index.html` and `dist/404.html` exist

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/pages/404.astro
git commit -m "feat: add About and 404 pages"
```

---

### Task 9: Playwright smoke tests (TDD)

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`
- Modify: `package.json` (devDependencies + scripts)

- [ ] **Step 1: Install Playwright**

Run:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Add test script to package.json**

Add to `package.json` scripts:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Create Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 4: Write smoke tests**

Create `e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const CAR_SLUGS = [
  "1970-vw-beetle",
  "2006-mercedes-c280",
  "1979-vw-bus",
  "1974-karmann-ghia",
  "2007-chrysler-300",
];

const CAR_NAMES: Record<string, string> = {
  "1970-vw-beetle": "1970 Volkswagen Beetle",
  "2006-mercedes-c280": "2006 Mercedes-Benz C280 4MATIC",
  "1979-vw-bus": "1979 Volkswagen Bus",
  "1974-karmann-ghia": "1974 Volkswagen Karmann Ghia Convertible",
  "2007-chrysler-300": "2007 Chrysler 300",
};

test("home page shows intro and garage cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Auto Panda Motive" })).toBeVisible();
  await expect(page.getByText("personal garage")).toBeVisible();
  await expect(page.getByRole("link", { name: /Volkswagen Beetle/i })).toBeVisible();
});

test("garage page lists owned cars", async ({ page }) => {
  await page.goto("/garage/");
  await expect(page.getByRole("heading", { name: "The Garage" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Volkswagen Beetle/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mercedes-Benz C280/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Volkswagen Bus/i })).toBeVisible();
});

test("memory lane lists former cars", async ({ page }) => {
  await page.goto("/memory-lane/");
  await expect(page.getByRole("heading", { name: "Memory Lane" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Karmann Ghia/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chrysler 300/i })).toBeVisible();
});

for (const slug of CAR_SLUGS) {
  test(`car page /cars/${slug}/ renders`, async ({ page }) => {
    await page.goto(`/cars/${slug}/`);
    await expect(page.getByRole("heading", { name: CAR_NAMES[slug] })).toBeVisible();
  });
}

test("about page loads", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
});

test("404 page shows garage link", async ({ page }) => {
  const response = await page.goto("/cars/nonexistent-slug/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /Go to The Garage/i })).toBeVisible();
});

test("car page at-a-glance visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cars/1970-vw-beetle/");
  const atAGlance = page.locator(".at-a-glance");
  await expect(atAGlance).toBeVisible();
  const box = await atAGlance.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.y).toBeLessThan(844);
  }
});
```

- [ ] **Step 5: Build and run tests**

Run:

```bash
npm run build
npm run test:e2e
```

Expected: PASS — all smoke tests green

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e/ package.json package-lock.json
git commit -m "test: add Playwright smoke test suite"
```

---

### Task 10: GitHub Actions deploy pipeline

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify workflow syntax locally**

Run: `npm run build && npm run test:e2e`  
Expected: PASS (workflow itself validates on first push)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow with Playwright gate"
```

---

### Task 11: Final verification

- [ ] **Step 1: Full local verification**

Run:

```bash
npm run build
npm run preview
```

Open `http://localhost:4321` and spot-check: home, garage, memory lane, one car page, about, 404.

- [ ] **Step 2: Run full test suite**

Run: `npm run test:e2e`  
Expected: PASS

- [ ] **Step 3: Post-deploy checklist (manual, after first push to main)**

- Enable GitHub Pages → source: GitHub Actions
- Add custom domain in repo Settings → Pages
- Add `public/CNAME` with domain when ready: `autopandamotive.com`
- Configure DNS CNAME to `<username>.github.io`

---

## Spec Coverage Checklist

| Spec requirement | Task |
|------------------|------|
| Garage vs Memory Lane ownership split | Task 3, 6 |
| Per-car QR URLs | Task 7 |
| Story timeline on car pages (not blog) | Task 7 |
| Flexible local/CDN images | Task 4 |
| Video embeds | Task 7 (StoryTimeline) |
| Modern Gallery B&W design | Task 2, 5, 6, 7 |
| Subtle panda branding | Task 5 |
| Five cars at launch | Task 3 |
| About page | Task 8 |
| Custom 404 | Task 8 |
| Playwright smoke tests | Task 9 |
| GitHub Pages CI/CD | Task 10 |
| Mobile-first car page | Task 7, 9 |

## Out of Scope (per spec)

- CMS / admin UI
- Visual regression tests
- Lightbox interaction E2E tests
- CDN image loading in CI
- Multi-browser matrix beyond Chromium
