# Hero Image Reveal Animation Design Spec

**Date:** 2026-06-21  
**Status:** Approved (brainstorming)

## Overview

Add a rapid, smooth entrance animation to cut-out hero images on car pages and the About page. The image stays hidden until the browser has decoded it, then fades in and lifts slightly. The title remains visible on first paint. This replaces the current pop-in where the headline appears immediately and the image flashes in a beat later.

## Goals

- Eliminate the jarring flash when hero images decode after the title paints
- Make the hero image feel prominent and intentional with a quick fade + lift
- Keep motion smooth (single ease-out, no bounce or loop)
- Animate the image only; title stays static
- Share one implementation across `CarHero` and `AboutHero`
- Respect `prefers-reduced-motion` (instant reveal, no animation)

## Non-Goals

- Animating the hero title or Memory Lane label
- Skeleton/shimmer placeholders while images load
- Changes to home hero, garage, or memory lane listing pages
- Photo gallery or car card hover animations
- Layout-shifting scale or bounce effects
- Server-side or build-time animation (must work on static pages)

## Design Direction (brainstorming outcomes)

| Decision | Choice |
|----------|--------|
| Animation trigger | When image is ready (`decode()` with `load` fallback) |
| What animates | Image only; title unchanged |
| Approach | Shared `HeroRevealImage.astro` component + CSS transition |
| Motion | Fade in + lift up (450ms ease-out) |
| Reduced motion | Skip animation; show image immediately when ready |

## Problem

Car and About heroes use `<img loading="eager">` with no entrance treatment. The bold `HeroTitle` paints immediately. Transparent cut-out images often decode a split second later, causing a visible pop-in that feels unintentional rather than polished.

The original car hero spec listed "no client-side JavaScript for the hero" as a non-goal. This feature requires a minimal script to gate the reveal on decode readiness. That trade-off is accepted for this animation.

## Motion Spec

| Property | Initial | Revealed | Duration | Easing |
|----------|---------|----------|----------|--------|
| `opacity` | `0` | `1` | `450ms` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `transform` | `translateY(16px)` | `translateY(0)` | `450ms` | same |

Notes:

- Animation runs once per page load when `.is-revealed` is added
- Existing cutout wrap offset (`translateY(-6%)` on `CarHero` / `AboutHero`) stays on the parent wrap; reveal transform applies to the image element inside
- Drop shadow (cutout mode) is on the same element as opacity, so it fades in with the image
- Cached images decode quickly; repeat visits feel like a near-instant snap, not a slow fade

### Reduced motion

When `prefers-reduced-motion: reduce` matches:

- Skip CSS transition
- Add `.is-revealed` and set `opacity: 1` immediately when the image is ready
- Same pattern as `CarCard.astro` hover motion overrides

## Component Architecture

### `HeroRevealImage.astro` (new)

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `src` | `string` | yes | Resolved image URL |
| `alt` | `string` | yes | Accessible alt text |
| `class` | `string` | no | Extra classes for mode-specific styling (e.g. cutout vs fallback) |

**Markup:**

```html
<img
  class:list={["hero-reveal__image", class]}
  src={src}
  alt={alt}
  loading="eager"
  decoding="async"
/>
```

The reveal class and transition target the `<img>` directly so parent wrap transforms are not fighting the animation.

**Script behavior:**

1. On `DOMContentLoaded` (or immediately if document already ready), find the component's image
2. If `img.complete` and image has dimensions, call reveal
3. Otherwise await `img.decode()` when supported; on success, reveal
4. On decode failure or unsupported browsers, fall back to `img.onload` / `img.onerror` (error still reveals to avoid a permanently hidden broken image)
5. `reveal()`: add `.is-revealed` to the image element
6. If `prefers-reduced-motion: reduce`, reveal without waiting for transition (CSS handles instant show)

Script must be scoped per instance (Astro component `<script>`) or use a data attribute + single init to avoid duplicate handlers on pages with one hero image.

**CSS:**

```css
.hero-reveal__image {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 450ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 450ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-reveal__image.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .hero-reveal__image {
    transition: none;
  }
}
```

Mode-specific styles (width, drop-shadow, fallback aspect ratio) remain on `CarHero` / `AboutHero` via the optional `class` prop passed through to the image.

### `CarHero.astro` (modify)

Replace the raw `<img class="car-hero__image" ... />` with:

```astro
<HeroRevealImage
  src={resolvedImage}
  alt={name}
  class="car-hero__image"
/>
```

Existing `.car-hero__image` rules for cutout/fallback sizing and drop-shadow stay in `CarHero.astro`. Remove any conflicting transform on `.car-hero__image` if present after integration.

### `AboutHero.astro` (modify)

Same swap: `<HeroRevealImage src={resolvedImage} alt="..." class="about-hero__image" />`.

## Theme and Accessibility

- No change to alt text or heading structure
- Motion is decorative; reduced-motion users get immediate visibility
- Hero image is not interactive; no focus changes
- `decoding="async"` avoids blocking the main thread during decode

## Testing

| Check | Expected |
|-------|----------|
| Car page hero image visible after load | Existing e2e smoke tests pass |
| About page hero image visible after load | Existing e2e smoke test passes |
| `npm run build` | Passes |
| Manual: slow 3G throttle | No pop-in flash; smooth fade + lift when image arrives |
| Manual: repeat visit (cached) | Quick, barely perceptible reveal |
| Manual: OS reduced motion enabled | Image appears instantly when ready, no slide |

Optional follow-up e2e: assert hero image has class `is-revealed` after `page.goto` with `waitUntil: 'networkidle'`. Not required for initial implementation.

## File Summary

| File | Action |
|------|--------|
| `src/components/HeroRevealImage.astro` | Create |
| `src/components/CarHero.astro` | Modify (use `HeroRevealImage`) |
| `src/components/AboutHero.astro` | Modify (use `HeroRevealImage`) |
| `e2e/smoke.spec.ts` | No change expected |
