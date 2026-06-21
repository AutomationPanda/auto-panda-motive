# Footer Attribution Design Spec

**Date:** 2026-06-21  
**Status:** Approved (design)

## Overview

Expand the site footer from a minimal brand stamp (panda icon + wordmark) into a stacked attribution block: brand row on top, three external links below. The footer provides site-wide credits and outbound links without duplicating nav or competing with car photography.

## Goals

- Attribute the site: link to the GitHub repo, Automation Panda, and Stick Shift Pandy on Instagram
- Keep the existing panda branding (icon + "Auto Panda Motive" wordmark)
- Match the Modern Gallery aesthetic: muted, monochrome, photography-first
- Left-aligned on desktop; centered on mobile
- Each link shows an icon plus a short text label
- Work in light and dark mode using existing CSS custom properties

## Non-Goals

- Copyright line
- Duplicate nav links (Home, Garage, Memory Lane, About stay in the header only)
- Theme toggle in the footer (stays in the nav)
- Config-driven link data layer (three fixed links are enough)
- Removing the GitHub mention from the About page (footer adds discoverability; About keeps in-context prose)
- New npm dependencies or icon libraries

## Approach

**Selected:** Dedicated `Footer.astro` component with inline SVG icons for GitHub and Instagram, and a scaled panda favicon for the Automation Panda link.

**Rejected alternatives:**

- Inline footer in `Layout.astro` (clutters the shell as icons and markup grow)
- `site-links.ts` config file (overkill for three stable URLs)

## Content

### Brand row (links to home)

- Panda favicon (24×24, theme-aware via `site-logo-icon`)
- Text: "Auto Panda Motive"
- `href`: site home (`withBase("/")`)

### Attribution links (external, new tab)

| Label | URL | Icon |
|-------|-----|------|
| GitHub | `https://github.com/AutomationPanda/auto-panda-motive` | GitHub mark (inline SVG) |
| Automation Panda | `https://automationpanda.com` | Panda favicon (16×16 `site-logo-icon` img) |
| Instagram | `https://www.instagram.com/stickshiftpandy/` | Instagram mark (inline SVG) |

All external links use `target="_blank"` and `rel="noopener noreferrer"`.

Link order: GitHub, Automation Panda, Instagram.

## Layout

```
┌─────────────────────────────────────────┐
│  [panda] Auto Panda Motive              │  ← brand row (links home)
│                                         │
│  [icon] GitHub  [icon] Automation Panda │  ← attribution row
│  [icon] Instagram                       │
└─────────────────────────────────────────┘
```

- Vertical stack with `gap: 1rem` between rows
- Desktop (`min-width: 640px`): left-aligned within `.container`
- Mobile: centered (brand row and link row as groups)
- Attribution row: horizontal flex, `gap: 1.25rem`, `flex-wrap: wrap`
- Mobile link row: `justify-content: center` so wrapped links stay centered

## Visual styling

Reuse existing footer container rules from `Layout.astro`:

- `margin-top: 4rem`, `padding: 2rem 0`
- `border-top: 1px solid var(--color-border)`
- `font-size: 0.875rem`, `color: var(--color-text-muted)`

**Brand row:** horizontal flex, `gap: 0.5rem`. Muted default color; hover uses `var(--color-accent)`.

**Attribution links:** inline-flex per link, `align-items: center`, `gap: 0.375rem`. Icons 16×16px, `currentColor` for SVG fills. Muted default; hover accent. Visible focus outline for keyboard users.

No new CSS custom properties. Dark mode handled by existing theme tokens and favicon swap script.

## Files to change

| File | Change |
|------|--------|
| `src/components/Footer.astro` | New: footer markup, inline SVGs, scoped styles |
| `src/components/Layout.astro` | Replace inline `<footer>` with `<Footer />`; remove footer-specific styles moved to `Footer.astro` |

## Testing

- [ ] `npm run build` succeeds
- [ ] Footer on home, About, and a car page: brand row + three links visible
- [ ] Desktop: left-aligned; mobile viewport: centered
- [ ] All three links open correct URLs in a new tab
- [ ] Brand row links to home
- [ ] Light and dark mode: text, borders, and icons readable; panda favicons swap with theme
- [ ] Narrow mobile: links wrap without breaking icon+label pairs

## References

- Original footer note: `docs/superpowers/specs/2026-06-19-auto-panda-motive-design.md` (panda logo + wordmark)
- About page links: `src/pages/about.astro` (Automation Panda, GitHub prose)
