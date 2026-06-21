# Car Page Hero Design Spec

**Date:** 2026-06-21  
**Status:** Approved

## Overview

Replace the disconnected full-width hero photo and bordered at-a-glance card on car pages with an integrated hero: bold car name above a transparent cut-out image that floats on the page background. The hook line stays on car cards (home, garage, memory lane) only and is removed from the car page itself.

## Goals

- Integrate hero image and car name into one cohesive hero section
- Make the car name bolder and more prominent (home-hero energy, theme-aware)
- Support transparent cut-out hero images that feel part of the page, not a static rectangle
- Apply the new hero to all car pages with a simpler fallback for placeholder images
- Keep the hook on `CarCard` listings only

## Non-Goals

- Changing car card layout or hook display on home/garage/memory lane
- New frontmatter fields (cut-out vs placeholder detected from image path)
- Global typography changes to site-wide `h1` styles
- Photo gallery or story timeline changes
- Client-side JavaScript for the hero
- Removing or changing the Memory Lane section label behavior

## Design Direction (brainstorming outcomes)

| Decision | Choice |
|----------|--------|
| Scope | All car pages, with placeholder fallback |
| Layout | Layered depth (option A), refined |
| Readable title placement | Above the car, never overlapped |
| Hook on car page | Removed (cards only) |
| Implementation | New `CarHero.astro` component |
| Cut-out detection | Automatic: `placeholder` in path = fallback mode |

## Hero Composition

Single `<section class="car-hero">` with two zones:

### Title block (top)

Always fully readable; the car image never overlaps this zone.

- Memory Lane label when `section === "memory-lane"`
- `<h1>` with full car name (`car.data.name`)
- Meta line: `{year} · {make} · {model}` in muted text
- Orange accent bar (`--color-hero-accent: #e85d04`, same as home hero)

### Stage (below title)

Layered depth treatment for cut-out images:

- Page background visible through (no full-bleed photo rectangle)
- Decorative watermark text behind the car only (abbreviated make/model, ~5% opacity, `aria-hidden`)
- Cut-out `<img>` centered, large, with `filter: drop-shadow(...)` for float effect
- Subtle bottom gradient fade into page content

For placeholder fallback mode:

- Same title block (identical typography)
- Placeholder image below, contained at fixed aspect ratio (not cover crop)
- No watermark, no drop-shadow theatrics

## Typography

| Element | Treatment |
|---------|-------------|
| `<h1>` | `font-weight: 800`, `clamp(1.75rem, 4vw + 0.5rem, 3rem)`, `line-height: 1.05`, `letter-spacing: -0.02em`, `--color-text` |
| Meta | `0.95rem`, `--color-text-muted` |
| Watermark | `font-weight: 900`, `clamp(3rem, 14vw, 7rem)`, ~5% opacity of `--color-text`, behind car only |

Car page `h1` overrides global `h1` styles (weight 300 site-wide) via scoped component styles, same pattern as `HomeHero.astro`.

## Hook Removal

- Remove hook paragraph from car page hero and from `AtAGlance`
- `CarCard.astro` unchanged: continues to show `hook` on listing cards
- `AtAGlance.astro` removed from car page; component deleted if unused elsewhere

## Cut-Out vs Placeholder Detection

```typescript
function isPlaceholderHero(src: string): boolean {
  return src.includes("placeholder");
}
```

- **Cut-out mode:** any `heroImage` path that does not contain `placeholder`
- **Fallback mode:** path contains `placeholder` (current SVG placeholders for Beetle, Bus, Ghia, Chrysler)

When Mercedes (or any car) gets a transparent WebP/PNG at `heroImage`, cut-out mode activates automatically with no content change beyond the image path.

## Component Architecture

### `CarHero.astro` (new)

**Props:** `name`, `year`, `make`, `model`, `section`, `heroImage`

**Markup structure:**

```html
<section class="car-hero" data-mode="cutout|fallback">
  <div class="container car-hero__title">
    [Memory Lane label]
    <h1>{name}</h1>
    <p class="car-hero__meta">{year} · {make} · {model}</p>
    <div class="car-hero__accent" aria-hidden="true"></div>
  </div>
  <div class="car-hero__stage">
    [watermark — cutout mode only]
    <img class="car-hero__image" src="..." alt="{name}" />
  </div>
</section>
```

### `[slug].astro` (modify)

- Replace bare `<img class="hero">` with `<CarHero car={car} />` or equivalent props
- Remove `AtAGlance` import and usage
- Content flow: hero → overview (if body) → gallery → stories

### `AtAGlance.astro` (delete)

Only used on car pages. Delete after `CarHero` replaces its responsibilities.

## Theme and Accessibility

- Hero follows site light/dark theme via existing `--color-*` tokens
- Cut-out image uses descriptive `alt={car.name}`
- Watermark is decorative: `aria-hidden="true"`
- Mobile-first: title stacks above car; stage image width ~90% of container, max ~700px
- Accent color scoped as `--color-hero-accent` on the component

## Testing

- Update e2e: car page `h1` still visible for all slugs
- Replace at-a-glance mobile test with car-hero mobile visibility test
- Assert hook text is **not** visible on car pages
- Assert hook text **is** still visible on garage card links
- `npm run build` passes

## File Summary

| File | Action |
|------|--------|
| `src/components/CarHero.astro` | Create |
| `src/pages/cars/[slug].astro` | Modify |
| `src/components/AtAGlance.astro` | Delete |
| `e2e/smoke.spec.ts` | Modify |
