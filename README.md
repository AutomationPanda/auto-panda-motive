# Auto Panda Motive

A personal website for showcasing hobby cars: stories, photos, and context for visitors at car shows who scan QR codes. Built with [Astro](https://astro.build/) as a static site and deployed to GitHub Pages.

**The Garage** lists cars currently owned. **Memory Lane** holds cars from the past. Each car has its own page with a photo gallery and story timeline.

## Requirements

- [Node.js](https://nodejs.org/) 22.12 or later

## Install

```bash
git clone https://github.com/AutomationPanda/auto-panda-motive.git
cd auto-panda-motive
npm ci
```

Install Playwright browsers (first time only, needed for tests):

```bash
npx playwright install chromium
```

## Run locally

Start the development server with hot reload:

```bash
npm run dev
```

Open [http://localhost:4321/auto-panda-motive/](http://localhost:4321/auto-panda-motive/).

Build the static site and preview the production output:

```bash
npm run build
npm run preview
```

Preview at [http://localhost:4321/auto-panda-motive/](http://localhost:4321/auto-panda-motive/).

## Deploy

The site publishes to GitHub Pages at:

**https://automationpanda.github.io/auto-panda-motive/**

Enable GitHub Pages in repo Settings (Source: GitHub Actions), then push to `main`.

When you register a custom domain later, update `astro.config.mjs` (`site` and `base: "/"`), add `public/CNAME`, and configure DNS.

## Tests

Run the Playwright smoke test suite (builds are tested against the preview server automatically):

```bash
npm run test:e2e
```

Run a production build first if you have not built recently:

```bash
npm run build && npm run test:e2e
```

## Content

Car and story content lives in Markdown under `src/content/`. Edit files there, add images under `public/images/cars/`, then commit and push to publish via GitHub Actions.

Design spec and implementation notes: `docs/superpowers/`
