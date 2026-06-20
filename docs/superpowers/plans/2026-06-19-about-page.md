# About Page Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder About page copy with the approved three-section content from `docs/superpowers/specs/2026-06-19-about-page-design.md`.

**Architecture:** Single Astro page update in `src/pages/about.astro`. Import `withBase` for internal links. No new components or styles required.

**Tech Stack:** Astro, existing Layout component, Playwright e2e smoke test

---

### Task 1: Update About page content

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Replace placeholder copy with three sections**

Update frontmatter import, Layout description, and body markup per spec.

- [ ] **Step 2: Run e2e smoke test**

Run: `npm run test:e2e -- e2e/smoke.spec.ts -g "about page"`
Expected: PASS
