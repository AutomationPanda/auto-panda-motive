# Car Page Story Images Design Spec

**Date:** 2026-06-27  
**Status:** Approved

## Overview

Improve car page image presentation by giving story timeline photos the same uniform grid treatment and lightbox behavior as the car Gallery section. Extract shared image components so Gallery and timeline stay visually consistent. Apply modest page-level spacing cleanup on car detail pages.

## Goals

- Eliminate jarring portrait vs landscape mismatch in story timeline thumbnails
- Make timeline images clickable with a lightbox that supports prev/next within each story
- Reuse one image grid + lightbox system for Gallery and Story Timeline
- Tighten vertical spacing and remove misleading hover effects on car pages

## Non-Goals

- Masonry or featured-image layouts
- Page-wide lightbox carousel across all stories
- Changing story content schema or frontmatter
- Redesigning the timeline structure into bordered cards
- Changing car hero, overview text, or car card listings
- Image optimization, CDN migration, or new image metadata fields

## Design Direction (brainstorming outcomes)

| Decision | Choice |
|----------|--------|
| Scope | Whole car page polish; story timeline images are top priority |
| Thumbnail layout | Uniform grid, 4:3 crop, `object-fit: cover` |
| Grid density | Medium: `minmax(160px, 1fr)`, ~3 columns on desktop |
| Lightbox scope | Story carousel: prev/next within one timeline entry only |
| Implementation | Shared `ImageGrid` + `Lightbox` components (Approach 1) |
| Gallery behavior | Same components; carousel navigates gallery images only |

## Component Architecture

### `ImageGrid.astro` (new)

Shared responsive thumbnail grid used by Gallery and Story Timeline.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `images` | `string[]` | Image paths or CDN URLs (resolved via `resolveImage()`) |
| `altPrefix` | `string` | Base alt text; each thumb gets `"${altPrefix} - photo ${n}"` |
| `lightboxId` | `string` | Links grid buttons to a matching `Lightbox` instance |
| `class` | `string?` | Optional extra class for layout context |

**Markup:**

- Container: `[data-image-grid]` with `data-lightbox-id` attribute
- Grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem`
- Each image: `<button type="button">` with bordered styling (`1px solid var(--color-border)`, `background: var(--color-bg-alt)`, `cursor: pointer`)
- Image inside button: `width: 100%; aspect-ratio: 4 / 3; object-fit: cover`
- Button carries `data-index` for lightbox navigation

**Styles:** Scoped to component. Grid and button styles move here from current `PhotoGallery.astro`.

### `Lightbox.astro` (new)

Shared modal lightbox with optional carousel navigation.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Must match `lightboxId` on paired `ImageGrid` |
| `carousel` | `boolean` | `true` | Show prev/next controls and keyboard navigation |

**Markup:**

- `<dialog>` with `[data-lightbox]` and matching `data-lightbox-id`
- Close button (top-right, existing styling)
- Main image element
- When `carousel: true`:
  - Prev/next buttons
  - Counter text (e.g. `2 / 6`)
  - Prev/next hidden or disabled when only one image

**Behavior (client script, one init per lightbox):**

- Click grid button: open dialog at that image index
- Prev/next buttons and Left/Right arrow keys cycle within the paired grid's image set
- Close: X button, backdrop click, Escape key
- Image src/alt updated from grid button data on navigation

**Accessibility:**

- Dialog uses native `<dialog>` focus trap
- Prev/next buttons have `aria-label`
- Counter uses `aria-live="polite"`

### `PhotoGallery.astro` (refactor)

Becomes a thin section wrapper:

```astro
<section class="gallery-section">
  <h2>Gallery</h2>
  <ImageGrid images={images} altPrefix={alt} lightboxId="gallery" />
  <Lightbox id="gallery" carousel={true} />
</section>
```

Renders nothing when `images.length === 0` (existing behavior preserved).

### `StoryTimeline.astro` (update)

Replace raw `<img>` tags in `.entry-images` with shared components:

```astro
<ImageGrid
  images={story.data.images}
  altPrefix={story.data.title}
  lightboxId={`story-${story.id}`}
/>
<Lightbox id={`story-${story.id}`} carousel={true} />
```

Each timeline entry gets a unique `lightboxId` derived from the story collection entry id, with `/` replaced by `--` for valid HTML ids (e.g. `story-2006-mercedes-c280--2025-06-22-drop-the-subframe`).

**Removed from timeline:**

- Loose grid (`minmax(140px, 1fr)`) with unconstrained image aspect ratios
- Image `scale(1.03)` hover effect on `.entry-images img`

## Page-Level Tightening

Changes on car detail page (`src/pages/cars/[slug].astro`) and `StoryTimeline.astro`:

| Element | Before | After |
|---------|--------|-------|
| `.content` grid gap | `2rem` | `1.5rem` |
| `.timeline-entry` bottom padding | `2rem` | `1.25rem` |
| Image hover scale | `scale(1.03)` + drop-shadow | removed (click affordance via bordered buttons) |
| Timeline body hover lift | `translateY(-2px)` | kept on text block only |

Empty gallery section remains hidden (no markup when `gallery: []`).

## File Changes

| File | Action |
|------|--------|
| `src/components/ImageGrid.astro` | Create |
| `src/components/Lightbox.astro` | Create |
| `src/components/PhotoGallery.astro` | Refactor to use shared components |
| `src/components/StoryTimeline.astro` | Replace entry images with shared components; spacing/hover cleanup |
| `src/pages/cars/[slug].astro` | Reduce content section gap |
| Playwright smoke test | Add or extend car page image/lightbox check |

## Testing

1. **Mercedes C280 page** (`/cars/2006-mercedes-c280/`):
   - Timeline thumbnails are uniform 4:3 size regardless of source orientation
   - Clicking a subframe story image opens lightbox at correct index
   - Prev/next cycles through all 6 subframe images without closing
   - Single-image story (Suki approves) opens lightbox; prev/next hidden or disabled

2. **Gallery regression:** Any car with populated `gallery` frontmatter still renders grid and opens lightbox with carousel across gallery images only

3. **Accessibility:** Dialog opens/closes via keyboard; prev/next respond to arrow keys

4. **Reduced motion:** No new motion-dependent behavior beyond existing timeline hover (already gated by `prefers-reduced-motion`)

## Success Criteria

- Story timeline images on the Mercedes C280 page look visually consistent (no portrait/landscape height mismatch in the grid)
- Every timeline thumbnail is clickable and opens a larger view
- Multi-image stories support in-entry carousel navigation
- Gallery and timeline share the same thumbnail and lightbox styling
- Car page vertical rhythm feels slightly tighter without layout breakage
