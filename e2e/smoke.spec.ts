import { expect, test } from "@playwright/test";

const CAR_SLUGS = [
  "1970-vw-beetle",
  "2006-mercedes-c280",
  "1979-vw-bus",
  "1974-karmann-ghia",
  "2007-chrysler-300",
];

const CAR_NAMES: Record<string, string> = {
  "1970-vw-beetle": "1970 Volkswagen Beetle",
  "2006-mercedes-c280": "2006 Mercedes-Benz C280 4MATIC",
  "1979-vw-bus": "1979 Volkswagen Bus",
  "1974-karmann-ghia": "1974 Volkswagen Karmann Ghia Convertible",
  "2007-chrysler-300": "2007 Chrysler 300",
};

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

function mainNav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: "Main" });
}

test.describe("responsive navigation", () => {
  test("mobile hides nav links until menu is opened", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("./");

    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.locator("#nav-menu")).not.toHaveClass(/is-open/);
    await expect(mainNav(page).getByRole("link", { name: "Home" })).toBeHidden();
    await expect(mainNav(page).getByRole("link", { name: "The Garage" })).toBeHidden();
  });

  test("desktop shows nav links and hides menu button", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("./");

    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    await expect(mainNav(page).getByRole("link", { name: "Home" })).toBeVisible();
    await expect(mainNav(page).getByRole("link", { name: "The Garage" })).toBeVisible();
    await expect(mainNav(page).getByRole("link", { name: "Memory Lane" })).toBeVisible();
    await expect(mainNav(page).getByRole("link", { name: "About" })).toBeVisible();
  });

  test("mobile menu opens, navigates, and closes after link click", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("./");

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    await expect(page.locator("#nav-menu")).toHaveClass(/is-open/);

    await mainNav(page).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/about/);
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.locator("#nav-menu")).not.toHaveClass(/is-open/);
  });

  test("mobile menu closes with Escape", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("./");

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.locator("#nav-menu")).not.toHaveClass(/is-open/);
  });

  test("mobile layout does not overflow horizontally", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("./");

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});

test("home page shows hero headline and garage cards", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Every car has a story." })).toBeVisible();
  await expect(page.getByText("These are the ones that are special to me.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Volkswagen Beetle/i })).toBeVisible();
});

test("garage page lists owned cars", async ({ page }) => {
  await page.goto("garage/");
  await expect(page.getByRole("heading", { name: "The Garage" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Volkswagen Beetle/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mercedes-Benz C280/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Volkswagen Bus/i })).toBeVisible();
});

test("memory lane lists former cars", async ({ page }) => {
  await page.goto("memory-lane/");
  await expect(page.getByRole("heading", { name: "Memory Lane" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Karmann Ghia/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chrysler 300/i })).toBeVisible();
});

for (const slug of CAR_SLUGS) {
  test(`car page /cars/${slug}/ renders`, async ({ page }) => {
    await page.goto(`cars/${slug}/`);
    await expect(page.getByRole("heading", { name: CAR_NAMES[slug] })).toBeVisible();
  });
}

test("car page does not show hook text", async ({ page }) => {
  await page.goto("cars/2006-mercedes-c280/");
  await expect(
    page.getByText("A sleek, refined ride that still drives as good today as it did when it was new.")
  ).not.toBeVisible();
});

test("garage card still shows hook text", async ({ page }) => {
  await page.goto("garage/");
  await expect(
    page.getByText("A sleek, refined ride that still drives as good today as it did when it was new.")
  ).toBeVisible();
});

test("about page loads", async ({ page }) => {
  await page.goto("about/");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
});

test("404 page shows garage link", async ({ page }) => {
  const response = await page.goto("cars/nonexistent-slug/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /Go to The Garage/i })).toBeVisible();
});

test("car page hero visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("cars/1970-vw-beetle/");
  const hero = page.locator(".car-hero");
  await expect(hero).toBeVisible();
  await expect(page.getByRole("heading", { name: CAR_NAMES["1970-vw-beetle"] })).toBeVisible();
  const box = await hero.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  }
});

test("theme toggle switches dark mode and persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./");
  await page.evaluate(() => localStorage.removeItem("theme"));
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: /switch to dark mode/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: /switch to light mode/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("follows system dark preference when no stored theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("./");
  await page.evaluate(() => localStorage.removeItem("theme"));
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
