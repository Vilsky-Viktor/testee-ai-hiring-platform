import { expect, test } from "@playwright/test";

import { REQUEST_URL } from "./helpers/env";
import { setScheme } from "./helpers/theme";
import { loaded, scrollAtRest } from "./helpers/waits";

// The hiring flow page: the header's link to it, its nine stages each with a picture of the real
// app in the page's theme, the ways two of them branch into, the start box at its end, and its
// address in another language. Wording is never checked.

// Its stages (frontend config/hiring-flow.ts FLOW_STAGES), and the ways the inviting and the
// sharing stages branch into.
const STAGES = 9;
const WAYS = [6, 5];

test("the header links the hiring flow page, marked current there", async ({ page }) => {
  await page.goto("/pricing");
  await page.getByRole("banner").locator('a[href="/hiring-flow"]').click();
  await expect(page).toHaveURL(/\/hiring-flow$/);
  await expect(page.getByRole("banner").locator('a[href="/hiring-flow"]')).toHaveAttribute(
    "aria-current",
    "page",
  );
  // Its guide, for the assistant and the page's help, is there.
  const guide = await page.request.get(`${REQUEST_URL}/api/site/help/pages/hiringFlow`);
  expect(guide.ok()).toBe(true);
});

test("each stage shows the picture of the page's theme", { tag: "@phone" }, async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await setScheme(page, scheme);
    await page.goto("/hiring-flow");
    await loaded(page);
    const pictures = page.locator('main img[src*="features"]:visible');
    await expect(pictures.first()).toBeVisible();
    const sources = await pictures.evaluateAll((images) =>
      images.map((image) => image.getAttribute("src")!),
    );

    expect(sources).toHaveLength(STAGES);
    expect(sources.every((source) => source.includes(`-${scheme}.webp`))).toBe(true);

    for (const picture of await pictures.all()) {
      await expect(picture).toHaveAttribute("alt", /.+/);
    }
  }
});

test("the ways two stages branch into are named lists of cards", async ({ page }) => {
  await page.goto("/hiring-flow");
  await loaded(page);
  const ways = page.locator("main ul[aria-label]");
  await expect(ways).toHaveCount(WAYS.length);

  for (const [index, count] of WAYS.entries()) {
    await expect(ways.nth(index)).toHaveAccessibleName(/.+/);
    await expect(ways.nth(index).getByTestId("icon-card")).toHaveCount(count);
  }
});

test("the hero leads to the start box at the end and to the features", async ({ page }) => {
  await page.goto("/hiring-flow");
  await loaded(page);
  const hero = page.getByRole("main").locator("header");
  await expect(hero.locator('a[href="/features"]')).toBeVisible();

  await hero.locator('a[href="#start"]').click();
  await scrollAtRest(page);
  await expect(page.locator("main section#start textarea")).toBeInViewport();
});

test("the hiring flow page has its own address in another language", async ({ page }) => {
  await page.goto("/hiring-flow");
  const english = await page.getByRole("heading", { level: 1 }).textContent();

  await page.goto("/de/hiring-flow");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  const german = page.getByRole("heading", { level: 1 });
  await expect(german).not.toBeEmpty();
  await expect(german).not.toHaveText(english!);
  await expect(page.getByRole("main").locator('a[href="/de/features"]').first()).toBeVisible();
});
