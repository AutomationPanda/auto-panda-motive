# Dark Mode Design Spec

**Date:** 2026-06-19  
**Status:** Draft (pending review)

## Overview

Add dark mode to Auto Panda Motive using the existing CSS custom property token system. Visitors get system-aware defaults with a manual override toggle. The dark palette is a true inversion of the current light monochrome theme, preserving the photography-first gallery feel.

## Goals

- Support dark mode across all pages without per-component rewrites
- Default to the visitor's OS/browser `prefers-color-scheme` preference
- Provide a nav toggle to override and persist light/dark choice in `localStorage`
- Prevent flash of wrong theme on first paint
- Keep strict monochrome: photos still provide all color

## Non-Goals

- Animated theme transitions
- Per-page theme overrides
- Dark-mode-specific images or favicon variants
- `meta theme-color` (deferred; marginal benefit for this site)
- A three-way "system / light / dark" toggle (YAGNI; toggle flips light ↔ dark only)

## Decisions

| Decision | Choice |
|----------|--------|
| Theme behavior | System default + manual override (persisted) |
| Dark palette | True inversion of light tokens |
| Toggle placement | Nav bar, right side (after nav links) |
| Implementation | CSS custom properties + `data-theme` on `<html>` |

## Theme Resolution

On every page load, an inline script in `<head>` (before CSS) resolves the theme:

1. If `localStorage.theme` is `"light"` or `"dark"`, apply it.
2. Else if `prefers-color-scheme: dark`, apply dark.
3. Else apply light.

The script sets `data-theme="light"` or `data-theme="dark"` on `<html>` synchronously to prevent flash of wrong theme (FOUC).

When the visitor clicks the toggle, the script flips `data-theme`, updates `localStorage.theme`, and updates the button's accessible label.

## Color Tokens

Light tokens remain in `:root` (unchanged). Dark tokens live in `[data-theme="dark"]`:

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#ffffff` | `#0a0a0a` |
| `--color-bg-alt` | `#f5f5f5` | `#1a1a1a` |
| `--color-text` | `#1a1a1a` | `#f5f5f5` |
| `--color-text-muted` | `#666666` | `#999999` |
| `--color-accent` | `#000000` | `#ffffff` |
| `--color-border` | `#e0e0e0` | `#333333` |
| `--color-overlay` | `rgba(0, 0, 0, 0.85)` | `rgba(0, 0, 0, 0.85)` |
| `--color-inverse-text` | `#ffffff` | `#ffffff` |

Lightbox overlay and close button colors are unchanged in both modes (dark backdrop, white close control).

Add `color-scheme: light dark` on `:root` so native scrollbars and form controls respect the active theme.

## Architecture

### Files changed

| File | Change |
|------|--------|
| `src/styles/global.css` | Add `[data-theme="dark"]` block with inverted tokens; add `color-scheme` |
| `src/components/Layout.astro` | Inline FOUC-prevention script in `<head>`; theme toggle in nav; client script for toggle |
| `e2e/smoke.spec.ts` | Dark mode smoke test |

### Files unchanged

All other components and pages (`CarCard`, `PhotoGallery`, `StoryTimeline`, `AtAGlance`, page `.astro` files) already consume `var(--color-*)` and require no changes.

### Optional extraction

If `Layout.astro` grows crowded, extract toggle markup and script into `src/components/ThemeToggle.astro`. Given the small scope, inline in Layout is acceptable.

## Toggle UI

- Small button at the right end of the nav links row (sticky header)
- Unicode sun/moon icons (☀ / ☾) or equivalent minimal icons inside a bordered button matching existing monochrome style
- `aria-label`: "Switch to dark mode" / "Switch to light mode" (updated on toggle)
- `aria-pressed` reflects current state
- On mobile, toggle remains visible at the end of the nav row

## Favicon

No change. The existing SVG favicon (black on transparent) works on both backgrounds.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| First visit, no `localStorage` | Follow `prefers-color-scheme`; no FOUC |
| Returning visitor with saved preference | Apply saved theme immediately in head script |
| `localStorage` unavailable | Toggle works for session; system preference on next visit |
| Lightbox open in dark mode | Dark overlay unchanged; white close button unchanged |

## Testing

### E2E (Playwright)

1. Load homepage; assert default theme (light unless system is dark).
2. Click theme toggle; assert `data-theme="dark"` on `<html>`.
3. Reload page; assert dark theme persisted via `localStorage`.
4. Click toggle again; assert return to light.

### Build

`npm run build` must pass. All theme logic is client-side inline script; no SSR or island framework required.

### Manual

Spot-check in both modes:

- Car page photo gallery and lightbox
- Memory Lane cards with section label
- Nav sticky header and toggle on mobile viewport

## Implementation Approach

**Recommended:** CSS custom properties + `data-theme` attribute.

Alternatives considered and rejected:

- **`prefers-color-scheme` only:** No manual override (does not meet requirements).
- **Separate light/dark stylesheets:** Duplication risk; unnecessary given token-based architecture.
