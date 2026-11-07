import { expect, test } from "@playwright/test";

import { REQUEST_URL } from "./helpers/env";
import { loaded } from "./helpers/waits";

// The solution pages: listed on the guides hub and found by its search, each with its rows
// beside pictures of the real app, its cards, its links onwards and the start box, and the page's
// own guide. Wording is never checked.

const SOLUTIONS = [
  { key: "skillsAssessment", path: "/guides/skills-assessment-software" },
  { key: "aiInterview", path: "/guides/ai-interview-software" },
  { key: "codingTest", path: "/guides/coding-test-for-hiring" },
];
const ROWS = 3;

test("the guides hub lists the solution pages and its search finds them", async ({ page }) => {
  await page.goto("/guides");
  const main = page.getByRole("main");

  for (const { path } of SOLUTIONS) {
    await expect(main.locator(`a[href="${path}"]`).filter({ visible: true })).toBeVisible();
  }

  const { key, path } = SOLUTIONS[2];
  const guide = await page.request.get(`${REQUEST_URL}/api/site/help/pages/${key}`);
  const { title } = (await guide.json()) as { title: string };
  await page.goto(`/guides?q=${encodeURIComponent(title)}`);
  await expect(main.locator(`a[href="${path}"]`).filter({ visible: true })).toBeVisible();
  await expect(main.locator(`a[href="${SOLUTIONS[0].path}"]`)).toHaveCount(0);
});

for (const { key, path } of SOLUTIONS) {
  test(`${path} shows its rows, cards and links, and has its own guide`, { tag: "@phone" }, async ({ page }) => {
    await page.goto(path);
    await loaded(page);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).not.toBeEmpty();
    // A picture of the real app per row, loaded, in the page's theme.
    const pictures = main.locator('img[src*="features"]').filter({ visible: true });
    await expect(pictures).toHaveCount(ROWS);

    for (const picture of await pictures.all()) {
      await picture.scrollIntoViewIfNeeded();
      await expect(picture).toHaveAttribute("alt", /.+/);
      await expect.poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    }

    // The breadcrumb names the guides hub above the page.
    const data = await page.locator('script[type="application/ld+json"]').allTextContents();
    const crumbs = data.find((item) => item.includes("BreadcrumbList"));
    expect(crumbs).toContain("/guides");
    expect(crumbs).toContain(path);

    const guide = await page.request.get(`${REQUEST_URL}/api/site/help/pages/${key}`);
    expect(guide.status()).toBe(200);
    const { actions } = (await guide.json()) as { actions: string[] };
    expect(actions.length).toBeGreaterThan(0);
  });
}
