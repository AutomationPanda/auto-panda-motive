# Home Page Hero Design Spec

**Date:** 2026-06-19  
**Status:** Approved (design)

## Overview

Replace the weak index page opener (site title + muted tagline) with a full-bleed photo hero that delivers a bold two-line statement over a car image. The hero borrows Filip Hric's confidence (oversized type, immediate impact) and the photo-forward layout from brainstorming option B, with headline copy from option 1.

## Goals

- Make the first screen memorable: bold statement, not a document title
- Communicate that every car has a story, and this site is about the cars special to Pandy
- Use a full-bleed hero photo with readable white type over a dark gradient overlay
- Keep the garage grid and rest of the home page unchanged below the hero
- Stay easy to update when real car photos replace placeholders (one-line image swap)

## Non-Goals

- Redesigning other pages (Garage, Memory Lane, About)
- Rotating or carousel hero images
- Repeating "Auto Panda Motive" in the hero (site name stays in nav only)
- Global typography changes to `h1` styles site-wide
- New npm dependencies or client-side JavaScript for the hero
- Stock photography or external image URLs (use project assets only)

## Design Direction (brainstorming outcomes)

| Decision | Choice |
|----------|--------|
| Layout style | Photo hero (option B) |
| Copy approach | Bold statement, not site title (option A energy) |
| Headline | Option 1: two-beat rhythm |
| Hero image | Option C: single best-available shot, configurable |

## Hero Copy

| Role | Text |
|------|------|
| Primary headline | Every car has a story. |
| Secondary headline | These are the ones that are special to me. |

No additional subtext or CTA button in the hero. Visitors scroll naturally into "The Garage" section.

## Visual Design

### Layout

- Full viewport width (break out of `.container`; hero is edge-to-edge)
- Minimum height: `clamp(22rem, 68vh, 36rem)` so the hero dominates the first screen on desktop and mobile
- Photo as CSS `background-image` with `background-size: cover` and `background-position: center`
- Dark gradient overlay: lighter at top, heavier at bottom (`linear-gradient` over the image) so white text stays legible on placeholders and real photos
- Text block bottom-aligned within the hero, horizontally constrained by the existing `.container` max-width

### Typography

- Primary line: `font-weight: 800`, responsive `clamp(2rem, 5vw + 1rem, 3.75rem)`, tight line-height (~1.05), white (`--color-inverse-text`)
- Secondary line: `font-weight: 600`, smaller `clamp(1rem, 2vw + 0.5rem, 1.5rem)`, slightly muted white (`rgba` or a new token)
- Optional accent: thin horizontal rule (3px) between primary and secondary lines using a new warm accent token (`--color-hero-accent`, e.g. `#e85d04`)

### Theme behavior

The hero is self-contained: dark overlay + white type. Appearance does not change when the user toggles light/dark mode. The rest of the page continues to follow `data-theme`.

### Placeholder images

All garage cars currently use SVG placeholders. The gradient overlay must be strong enough that placeholders look intentional, not broken. When a real photo is added, only the configured `heroImage` path changes.

## Component Architecture

### `HomeHero.astro` (new)

Single-purpose hero component used only on the home page.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `headlinePrimary` | `string` | Large headline line |
| `headlineSecondary` | `string` | Supporting headline line |
| `imageSrc` | `string` | Path or URL passed through `resolveImage()` |
| `imageAlt` | `string` | Descriptive alt text (used on a visually hidden `img` for accessibility) |

**Markup structure:**

```html
<section class="home-hero">
  <img class="home-hero__sr-image" src="..." alt="1970 Volkswagen Beetle" />
  <div class="home-hero__overlay" aria-hidden="true"></div>
  <div class="container home-hero__content">
    <h1 class="home-hero__primary">Every car has a story.</h1>
    <div class="home-hero__accent" aria-hidden="true"></div>
    <p class="home-hero__secondary">These are the ones that are special to me.</p>
  </div>
</section>
```

The section uses the same `background-image` URL as the sr-only `<img>` (via inline style or CSS variable set from `resolveImage()`). The `<img>` is visually hidden but available to screen readers. Use a real `<h1>` for the primary headline (one per page). Secondary line is a `<p>` (not a second heading).

**Accessibility:**

- One `h1` on the home page (primary headline)
- Visually hidden `<img>` with meaningful `alt` describing the featured car
- Sufficient color contrast for white text on the darkened overlay (WCAG AA)

### `index.astro` (modified)

```astro
---
const heroImage = "/images/cars/1970-vw-beetle/placeholder.svg";
const heroImageAlt = "1970 Volkswagen Beetle";
---

<Layout title="Auto Panda Motive">
  <HomeHero
    headlinePrimary="Every car has a story."
    headlineSecondary="These are the ones that are special to me."
    imageSrc={heroImage}
    imageAlt={heroImageAlt}
  />
  <div class="container page">
    <h2>The Garage</h2>
    ...
  </div>
</Layout>
```

Remove the existing `<h1>Auto Panda Motive</h1>` and `<p class="intro">` block. Remove the page-local `.intro` style (no longer used on index).

### CSS custom properties

Add hero-scoped tokens in `HomeHero.astro` (not global.css unless reused elsewhere):

| Token | Purpose |
|-------|---------|
| `--color-hero-accent` | Accent rule between headline lines |
| `--color-hero-overlay` | Gradient overlay stops (can use inline gradient instead) |

Reuse existing `--color-inverse-text` for headline color where applicable.

## Files to Change

| File | Change |
|------|--------|
| `src/components/HomeHero.astro` | New component |
| `src/pages/index.astro` | Wire hero, remove old title/intro |
| `e2e/smoke.spec.ts` | Update home page assertions for new headline |

## Testing

| Check | Expected |
|-------|----------|
| `/` returns 200 | Existing smoke test passes |
| Primary headline visible | `getByRole("heading", { name: "Every car has a story." })` |
| Secondary line visible | Text "These are the ones that are special to me." |
| Garage cards still visible | Beetle card link still present |
| Single `h1` on home | Only the hero primary line |
| Mobile viewport | Headline readable, hero not collapsed awkwardly |
| `npm run build` | Passes |
| Theme toggle on home | Hero appearance unchanged; page below still themes |

Update the home smoke test: remove assertions for "Auto Panda Motive" heading and "personal garage" intro text; assert new headline copy instead.

## Future Enhancements (out of scope)

- Swap `heroImage` to a real photograph when available
- Optional scroll cue animation into The Garage
- Per-car hero image pulled from content collection metadata
