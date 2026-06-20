# About Page Content Design Spec

**Date:** 2026-06-19  
**Status:** Approved (content design)

## Overview

Replace the placeholder About page copy with car-first, scannable content that introduces the site, explains the "Auto Panda Motive" name, and identifies the owner as Pandy. The page serves car enthusiasts first (friends, show visitors who scan QR codes) while giving software-world visitors enough context to understand the Automation Panda connection.

## Goals

- Explain what Auto Panda Motive is and what visitors will find (Garage, Memory Lane, car pages)
- Clarify this is a personal hobby site, not a shop, business, or blog
- Explain the name pun and link to [automationpanda.com](https://automationpanda.com) without making the page a professional bio
- Introduce the owner by first name only ("Pandy"), no photo
- Match the warm, conversational tone of the home page and car hooks
- Stay readable on mobile in under a minute (~150–200 words total)

## Non-Goals

- Owner photo or headshot
- Location, social links, or contact info
- Detailed professional biography or résumé content
- FAQ-style layout (rejected in favor of three narrative sections)
- New components, images, or layout changes beyond section headings and spacing
- Updates to other pages (home intro, nav, footer)

## Audience

| Reader | What they need from About |
|--------|---------------------------|
| Car enthusiast (friend/acquaintance) | Context for the site and who Pandy is |
| Car show visitor (QR scan) | Quick answer: what is this site, why these cars |
| Software-world visitor | Brief Automation Panda connection, then back to cars |

## Content Structure

Three sections under an `h1` page title. Each section uses an `h2` heading. First person throughout.

### Page metadata

| Field | Value |
|-------|-------|
| Page title (Layout) | `About` |
| Meta description | `About Auto Panda Motive, Pandy's personal garage for car stories and photos.` |

### Section 1: The garage

**Heading:** `The garage`

**Purpose:** Answer "What is this site?" car-first.

**Copy:**

> Auto Panda Motive is my personal garage online: the cars I work on, the stories behind them, and the photos along the way.
>
> Browse [The Garage](/garage/) for what I have now, or [Memory Lane](/memory-lane/) for cars from the past. Each car has its own page with photos and a timeline of work and adventures.
>
> This is not a shop, a business, or a blog. It is a hobby I enjoy sharing with friends, fellow enthusiasts, and anyone who scanned a QR code at a show and wanted to know more.

**Links:**

- The Garage → `/garage/` (via `withBase`)
- Memory Lane → `/memory-lane/` (via `withBase`)

### Section 2: Why "Auto Panda Motive"

**Heading:** `Why "Auto Panda Motive"`

**Purpose:** Explain the name, weave in engineering mindset, link to professional site as aside.

**Copy:**

> The name is a play on **Automation Panda**, my professional moniker for test automation and software quality ([automationpanda.com](https://automationpanda.com)). Same panda, different motor.
>
> Cars and code both reward patience, careful work, and the stubborn satisfaction of fixing something until it runs right. The panda is a reminder that the work should stay fun, even when the project stretches longer than planned.

**Links:**

- automationpanda.com → `https://automationpanda.com` (external, `target="_blank"`, `rel="noopener noreferrer"`)

### Section 3: Hi, I'm Pandy

**Heading:** `Hi, I'm Pandy`

**Purpose:** Minimal personal intro, steer back to cars.

**Copy:**

> I'm Pandy, a software engineer by trade and a car enthusiast by choice. I built this site for the hobby side: wrench-turning, road trips, and projects that never quite finish. Thanks for stopping by.

## Visual and markup

- Reuse existing page shell: `Layout`, `container page` classes from `about.astro`
- No new CSS required; optional small spacing between sections (e.g. `margin-top` on `h2` after the first) if default heading spacing feels tight
- Bold "Automation Panda" inline with `<strong>` (matches emphasis in draft)
- No em dashes in prose (site rule)

## Testing

| Check | Expected |
|-------|----------|
| `/about/` returns 200 | Existing e2e smoke test passes |
| Page contains all three section headings | Visible in DOM |
| Internal links resolve | Garage and Memory Lane hrefs include base path if configured |
| External link | automationpanda.com opens in new tab with safe rel attributes |
| Meta description | Updated in Layout `description` prop |

Existing Playwright test (`about page loads`) only checks the heading "About" is visible. No new e2e tests required unless we add assertions for section content later.

## Files to change

| File | Change |
|------|--------|
| `src/pages/about.astro` | Replace placeholder paragraphs with three sections, update meta description, add links |
