# Home Hero Overlay Design

**Date:** 2026-06-20  
**Status:** Approved (design)

## Overview

Use a single theme-aware hero overlay: bottom-only dark scrim for headline legibility, with a soft fade to page background at the bottom edge. Same gradient in light and dark mode; only the fade target (`--color-bg`) changes with theme.

## Problem

The hero originally used a full-height dark gradient overlay in all themes. In light mode this created a dark slab between the bright nav and "The Garage" section. A heavier dark-mode-only overlay was also unnecessary once the bottom fade handled text and page transition.

## Chosen Approach: Unified Hybrid

- **Top ~50%:** photo unobstructed
- **Bottom ~40%:** dark scrim for white headline text
- **Bottom edge:** fade to `var(--color-bg)` for smooth handoff into page content

## Overlay Gradient

One gradient for all themes (top to bottom):

| Stop | Value |
|------|-------|
| 0% | `transparent` |
| 50% | `transparent` |
| 70% | `rgba(0, 0, 0, 0.35)` |
| 88% | `rgba(0, 0, 0, 0.65)` |
| 100% | `var(--color-bg)` |

White headline and secondary text unchanged (`--color-inverse-text`, `--color-hero-secondary`).

Hero fallback `background-color`: `var(--color-bg-alt)` (theme-aware via global tokens).

No theme-specific overlay selectors in `HomeHero.astro`.

## Non-Goals

- Dark text on photo
- Full-height cinematic tint in either theme
- Carousel or multiple hero images
- Changes to hero copy, layout, or min-height
- Global CSS token changes

## Files to Change

| File | Change |
|------|--------|
| `src/components/HomeHero.astro` | Single overlay gradient; remove dark-mode overrides |

## Success Criteria

- Both themes: upper portion of hero photo is unobstructed; headline remains readable; bottom edge blends into page background
- No new dependencies or client-side JavaScript
