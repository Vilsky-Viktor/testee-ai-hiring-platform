import type { Locator, Page } from "@playwright/test";

import { REQUEST_URL } from "./helpers/env";
import { expect, test } from "./helpers/templates";
import { loaded } from "./helpers/waits";

// A search over a list (SearchedList, shared by every list with a search on top) and the list, or
// its empty state, read as one block: no gap, the same width, square corners where they meet, and
// one border round both, with a single line at the seam. Checked on the practice page's templates,
// on a computer and a phone (the two projects). Every list's search searches as you type, with no
// button: the address's q changes once typing pauses, the list's other parameters stay, and the
// clear button empties it.

/** The block's search field and what continues under it, with the styles that join them. */
async function block(page: Page) {
  const searched = page.locator('[data-slot="searched-list"]');
  const field = searched.locator(":scope > :first-child");
  const under = searched.locator(":scope > :last-child");
  await expect(field).toBeVisible();
  await expect(under).toBeVisible();
  const style = (locator: Locator) =>
    locator.evaluate((element) => {
      const css = getComputedStyle(element);

      return {
        top: css.borderTopWidth,
        bottom: css.borderBottomWidth,
        topColor: css.borderTopColor,
        bottomColor: css.borderBottomColor,
        topStart: css.borderTopLeftRadius,
        bottomStart: css.borderBottomLeftRadius,
      };
    });

  return {
    field: { box: (await field.boundingBox())!, css: await style(field) },
    under: { box: (await under.boundingBox())!, css: await style(under) },
  };
}

async function expectOneBlock(page: Page) {
  const { field, under } = await block(page);

  expect(Math.abs(field.box.y + field.box.height - under.box.y)).toBeLessThan(1);
  expect(Math.abs(field.box.x - under.box.x)).toBeLessThan(1);
  expect(Math.abs(field.box.width - under.box.width)).toBeLessThan(1);
  expect(field.css.bottomStart).toBe("0px");
  expect(under.css.topStart).toBe("0px");
  // One line at the seam: the field's bottom border, none on top of what follows.
  expect(field.css.bottom).toBe("1px");
  expect(under.css.top).toBe("0px");
  // The field's outline is the list's.
  expect(field.css.top).toBe("1px");
  expect(field.css.topColor).toBe(under.css.bottomColor);
}

test("a search and its results read as one block", { tag: "@phone" }, async ({ page, addTemplate }) => {
  const template = await addTemplate();
  await page.goto(`/practice?q=${encodeURIComponent(template.title)}`);
  await expect(page.locator(`a[href*="${template.slug}"]`).first()).toBeVisible();

  await expectOneBlock(page);
});

test("a search with no results reads as one block with its empty state", { tag: "@phone" }, async ({ page }) => {
  await page.goto(`/practice?q=no-match-${Date.now()}`);
  await expect(page.locator('[data-slot="searched-list"] > p')).toBeVisible();

  await expectOneBlock(page);
});

/** The searched list's field and its clear button (there once something is typed). */
function searchField(page: Page) {
  const field = page.getByRole("main").getByRole("searchbox");

  return { field, clear: field.locator("..").getByRole("button") };
}

test("the tests are searched as you type, keeping the chosen languages", async ({ page, addTemplate }) => {
  const template = await addTemplate();
  await page.goto("/tests?lang=en");
  await loaded(page);
  const { field, clear } = searchField(page);
  await expect(clear).toHaveCount(0);

  await field.fill(template.title);
  await expect(page).toHaveURL((url) => url.searchParams.get("q") === template.title);
  expect(new URL(page.url()).searchParams.getAll("lang")).toEqual(["en"]);
  await expect(
    page.locator(`main a[href*="${template.slug}"]`).filter({ visible: true }).first(),
  ).toBeVisible();

  await clear.click();
  await expect(page).toHaveURL((url) => !url.searchParams.has("q") && url.searchParams.get("lang") === "en");
  await expect(field).toHaveValue("");
  await expect(clear).toHaveCount(0);
});

test("the guides are searched as you type, best first", async ({ page }) => {
  const response = await page.request.get(`${REQUEST_URL}/api/site/search?kind=guide&limit=50&q=hiring`);
  const found = ((await response.json()) as { path: string }[]).map((result) => result.path);
  expect(found.length).toBeGreaterThan(0);
  await page.goto("/guides");
  await loaded(page);
  const { field } = searchField(page);
  const guides = page
    .locator('main [data-slot="searched-list"] a[href^="/guides/"]')
    .filter({ visible: true });
  await expect(guides.first()).toBeVisible();

  await field.fill("hiring");
  await expect(page).toHaveURL(/[?&]q=hiring/);
  await expect
    .poll(() => guides.evaluateAll((links) => links.map((link) => link.getAttribute("href"))))
    .toEqual(found);

  // Nothing matching: the empty state, at once on Enter.
  await field.fill(`no-match-${Date.now()}`);
  await field.press("Enter");
  await expect(page.locator('[data-slot="searched-list"] > p').filter({ visible: true })).toBeVisible();
  await expect(guides).toHaveCount(0);
});
