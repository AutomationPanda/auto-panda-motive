# Car Page Story Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give story timeline images the same uniform 4:3 grid and carousel lightbox as the car Gallery, via shared `ImageGrid` and `Lightbox` components, per `docs/superpowers/specs/2026-06-27-car-page-story-images-design.md`.

**Architecture:** Extract grid markup/styles and lightbox dialog/script from `PhotoGallery.astro` into reusable components. `PhotoGallery` and `StoryTimeline` both compose them. Each story entry gets a sanitized `lightboxId` so carousel navigation stays scoped to that entry's images.

**Tech Stack:** Astro 6, raw CSS custom properties, native `<dialog>`, Playwright e2e

---

## File map

| File | Responsibility |
|------|----------------|
| `src/components/ImageGrid.astro` | Uniform 4:3 thumbnail grid; clickable buttons linked to a lightbox id |
| `src/components/Lightbox.astro` | Modal dialog with prev/next carousel, keyboard nav, image counter |
| `src/components/PhotoGallery.astro` | Thin section wrapper around shared components |
| `src/components/StoryTimeline.astro` | Replace raw `<img>` tags; spacing/hover cleanup |
| `src/pages/cars/[slug].astro` | Tighter content section gap |
| `e2e/smoke.spec.ts` | Assert uniform thumbnails, lightbox open, carousel navigation |

---

### Task 1: Add failing e2e tests for story images

**Files:**
- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Append story image tests**

Add before the `theme toggle` test at the end of `e2e/smoke.spec.ts`:

```typescript
test("story timeline thumbnails share uniform aspect ratio", async ({ page }) => {
  await page.goto("cars/2006-mercedes-c280/");

  const subframeEntry = page.locator(".timeline-entry", {
    has: page.getByRole("heading", { name: "Dropping the rear subframe" }),
  });
  const thumbs = subframeEntry.locator("[data-image-grid] button img");
  await expect(thumbs).toHaveCount(6);

  const boxes = await thumbs.evaluateAll((images) =>
    images.map((img) => {
      const rect = img.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    })
  );

  for (const box of boxes) {
    expect(box.width).toBeGreaterThan(0);
    expect(Math.abs(box.width / box.height - 4 / 3)).toBeLessThan(0.05);
  }
});

test("story timeline image opens lightbox with carousel", async ({ page }) => {
  await page.goto("cars/2006-mercedes-c280/");

  const subframeEntry = page.locator(".timeline-entry", {
    has: page.getByRole("heading", { name: "Dropping the rear subframe" }),
  });
  await subframeEntry.getByRole("button", { name: "Open image 1 of 6" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-lightbox-image]")).toBeVisible();
  await expect(dialog.getByText("1 / 6")).toBeVisible();

  await dialog.getByRole("button", { name: "Next image" }).click();
  await expect(dialog.getByText("2 / 6")).toBeVisible();

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});

test("single-image story lightbox hides carousel controls", async ({ page }) => {
  await page.goto("cars/2006-mercedes-c280/");

  const sukiEntry = page.locator(".timeline-entry", {
    has: page.getByRole("heading", { name: "Suki approves" }),
  });
  await sukiEntry.getByRole("button", { name: "Open image 1 of 1" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Previous image" })).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Next image" })).toBeHidden();

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:e2e -- e2e/smoke.spec.ts -g "story timeline|single-image story"`
Expected: FAIL (`[data-image-grid]` not found; dialog does not open)

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test: expect uniform story thumbnails and carousel lightbox"
```

---

### Task 2: Create ImageGrid component

**Files:**
- Create: `src/components/ImageGrid.astro`

- [ ] **Step 1: Add the component**

Create `src/components/ImageGrid.astro`:

```astro
---
import { resolveImage } from "../utils/image";

interface Props {
  images: string[];
  altPrefix: string;
  lightboxId: string;
  class?: string;
}

const { images, altPrefix, lightboxId, class: className } = Astro.props;
---

{
  images.length > 0 && (
    <div
      class:list={["image-grid", className]}
      data-image-grid
      data-lightbox-id={lightboxId}
    >
      {images.map((src, index) => (
        <button
          type="button"
          class="image-grid__item"
          data-index={index}
          aria-label={`Open image ${index + 1} of ${images.length}`}
        >
          <img
            src={resolveImage(src)}
            alt={`${altPrefix} - photo ${index + 1}`}
            loading="lazy"
          />
        </button>
      ))}
    </div>
  )
}

<style>
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .image-grid__item {
    padding: 0;
    border: 1px solid var(--color-border);
    background: var(--color-bg-alt);
    cursor: pointer;
  }

  .image-grid__item img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }
</style>
```

- [ ] **Step 2: Build to verify no compile errors**

Run: `npm run build`
Expected: PASS (component unused is fine)

- [ ] **Step 3: Commit**

```bash
git add src/components/ImageGrid.astro
git commit -m "feat: add shared ImageGrid component for uniform thumbnails"
```

---

### Task 3: Create Lightbox component with carousel

**Files:**
- Create: `src/components/Lightbox.astro`

- [ ] **Step 1: Add the component**

Create `src/components/Lightbox.astro`:

```astro
---
interface Props {
  id: string;
  carousel?: boolean;
}

const { id, carousel = true } = Astro.props;
---

<dialog class="lightbox" data-lightbox data-lightbox-id={id} aria-label="Image viewer">
  <button type="button" class="lightbox__close" data-close aria-label="Close">
    ×
  </button>
  {
    carousel && (
      <>
        <button type="button" class="lightbox__nav lightbox__nav--prev" data-prev aria-label="Previous image">
          ‹
        </button>
        <button type="button" class="lightbox__nav lightbox__nav--next" data-next aria-label="Next image">
          ›
        </button>
        <p class="lightbox__counter" data-counter aria-live="polite"></p>
      </>
    )
  }
  <img src="" alt="" data-lightbox-image />
</dialog>

<script>
  function initLightbox(dialog: HTMLDialogElement): void {
    const lightboxId = dialog.dataset.lightboxId;
    if (!lightboxId) return;

    const grid = document.querySelector<HTMLElement>(
      `[data-image-grid][data-lightbox-id="${lightboxId}"]`
    );
    const lightboxImage = dialog.querySelector<HTMLImageElement>("[data-lightbox-image]");
    const closeButton = dialog.querySelector<HTMLElement>("[data-close]");
    const prevButton = dialog.querySelector<HTMLButtonElement>("[data-prev]");
    const nextButton = dialog.querySelector<HTMLButtonElement>("[data-next]");
    const counter = dialog.querySelector<HTMLElement>("[data-counter]");

    if (!grid || !lightboxImage) return;

    const buttons = Array.from(grid.querySelectorAll<HTMLButtonElement>(".image-grid__item"));
    let currentIndex = 0;

    function showAt(index: number): void {
      const button = buttons[index];
      const img = button?.querySelector("img");
      if (!(img instanceof HTMLImageElement)) return;

      currentIndex = index;
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;

      if (counter) {
        counter.textContent = `${index + 1} / ${buttons.length}`;
      }

      const singleImage = buttons.length <= 1;
      if (prevButton) prevButton.hidden = singleImage;
      if (nextButton) nextButton.hidden = singleImage;
    }

    function showRelative(delta: number): void {
      if (buttons.length <= 1) return;
      const nextIndex = (currentIndex + delta + buttons.length) % buttons.length;
      showAt(nextIndex);
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        showAt(index);
        dialog.showModal();
      });
    });

    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    prevButton?.addEventListener("click", () => showRelative(-1));
    nextButton?.addEventListener("click", () => showRelative(1));

    dialog.addEventListener("keydown", (event) => {
      if (!dialog.open) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showRelative(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showRelative(1);
      }
    });
  }

  document.querySelectorAll<HTMLDialogElement>("[data-lightbox]").forEach(initLightbox);
</script>

<style>
  .lightbox {
    border: none;
    padding: 0;
    max-width: 95vw;
    max-height: 95vh;
    background: transparent;
    overflow: visible;
  }

  .lightbox::backdrop {
    background: var(--color-overlay);
  }

  .lightbox img {
    display: block;
    max-width: 90vw;
    max-height: 85vh;
    margin: auto;
  }

  .lightbox__close {
    position: fixed;
    top: 1rem;
    right: 1rem;
    font-size: 2rem;
    line-height: 1;
    color: var(--color-inverse-text);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .lightbox__nav {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2.5rem;
    line-height: 1;
    color: var(--color-inverse-text);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem 0.75rem;
  }

  .lightbox__nav--prev {
    left: 1rem;
  }

  .lightbox__nav--next {
    right: 1rem;
  }

  .lightbox__counter {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    color: var(--color-inverse-text);
    font-size: 0.9rem;
  }
</style>
```

- [ ] **Step 2: Build to verify no compile errors**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/Lightbox.astro
git commit -m "feat: add shared Lightbox with story-scoped carousel"
```

---

### Task 4: Refactor PhotoGallery to use shared components

**Files:**
- Modify: `src/components/PhotoGallery.astro`

- [ ] **Step 1: Replace PhotoGallery contents**

Replace the entire contents of `src/components/PhotoGallery.astro` with:

```astro
---
import ImageGrid from "./ImageGrid.astro";
import Lightbox from "./Lightbox.astro";

interface Props {
  images: string[];
  alt: string;
}

const { images, alt } = Astro.props;
---

{
  images.length > 0 && (
    <section class="gallery-section">
      <h2>Gallery</h2>
      <ImageGrid images={images} altPrefix={alt} lightboxId="gallery" />
      <Lightbox id="gallery" carousel={true} />
    </section>
  )
}

<style>
  .gallery-section h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
</style>
```

- [ ] **Step 2: Build to verify**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/PhotoGallery.astro
git commit -m "refactor: PhotoGallery uses shared ImageGrid and Lightbox"
```

---

### Task 5: Wire ImageGrid and Lightbox into StoryTimeline

**Files:**
- Modify: `src/components/StoryTimeline.astro`

- [ ] **Step 1: Add imports and lightbox id helper**

At the top of the frontmatter, after existing imports, add:

```astro
import ImageGrid from "./ImageGrid.astro";
import Lightbox from "./Lightbox.astro";

function storyLightboxId(storyId: string): string {
  return `story-${storyId.replace(/\//g, "--")}`;
}
```

- [ ] **Step 2: Replace entry images block**

Replace the `{story.data.images.length > 0 && (...)}` block inside the timeline map with:

```astro
{story.data.images.length > 0 && (
  <>
    <ImageGrid
      images={story.data.images}
      altPrefix={story.data.title}
      lightboxId={storyLightboxId(story.id)}
      class="entry-images"
    />
    <Lightbox id={storyLightboxId(story.id)} carousel={true} />
  </>
)}
```

- [ ] **Step 3: Remove obsolete entry-images grid styles and image hover**

In the `<style>` block of `StoryTimeline.astro`:

1. Change `.timeline-entry` padding from `0 0 2rem 1.25rem` to `0 0 1.25rem 1.25rem`
2. Delete the entire `.entry-images { ... }` rule block
3. Delete the `.entry-images img { ... }` rule block
4. Delete the `.timeline-entry:hover .entry-images img { ... }` rule block
5. In the `@media (prefers-reduced-motion: reduce)` block, remove references to `.entry-images img`

Add spacing for the grid wrapper:

```css
.entry-images {
  margin-top: 0.75rem;
}
```

- [ ] **Step 4: Run e2e tests**

Run: `npm run test:e2e -- e2e/smoke.spec.ts -g "story timeline|single-image story"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StoryTimeline.astro
git commit -m "feat: story timeline uses shared image grid and carousel lightbox"
```

---

### Task 6: Tighten car page spacing

**Files:**
- Modify: `src/pages/cars/[slug].astro`

- [ ] **Step 1: Reduce content grid gap**

In `src/pages/cars/[slug].astro`, change `.content` gap from `2rem` to `1.5rem`:

```css
.content {
  padding: 1.25rem 0 3rem;
  display: grid;
  gap: 1.5rem;
}
```

- [ ] **Step 2: Run full e2e suite**

Run: `npm run test:e2e`
Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/cars/[slug].astro
git commit -m "style: tighten car page content section spacing"
```

---

### Task 7: Final verification

**Files:**
- None (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: PASS with no errors

- [ ] **Step 2: Manual spot check**

Run: `npm run dev`
Open: `http://localhost:4321/cars/2006-mercedes-c280/`
Verify:
- Subframe story shows uniform 4:3 thumbnails
- Click opens lightbox; prev/next cycles through 6 images
- Suki approves single-image story opens lightbox without nav buttons

- [ ] **Step 3: Full e2e suite**

Run: `npm run test:e2e`
Expected: all tests PASS

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Uniform 4:3 grid, minmax(160px) | Task 2 |
| Story-scoped carousel lightbox | Task 3, Task 5 |
| Shared components for Gallery + Timeline | Task 2, 3, 4, 5 |
| Sanitized story lightbox ids | Task 5 (`storyLightboxId`) |
| Single-image hides prev/next | Task 3 (`hidden` when length <= 1) |
| Timeline spacing/hover cleanup | Task 5 |
| Car page content gap 1.5rem | Task 6 |
| Playwright smoke tests | Task 1, 5, 7 |
| Gallery empty array hidden | Task 4 (unchanged guard) |
| Keyboard arrow navigation | Task 3 |
| aria-live counter | Task 3 |

## Execution notes

- Multiple `Lightbox` instances on the Mercedes page (one per story with images) is expected. Each init binds to its paired grid via `data-lightbox-id`.
- Do not add a page-wide lightbox. Carousel scope is always one grid's button set.
- Keep existing timeline sort script untouched.
