import { randomUUID } from "node:crypto";

import type { Page } from "@playwright/test";

import { pauseClock } from "./helpers/clock";
import { REQUEST_URL } from "./helpers/env";
import { expect, test } from "./helpers/templates";
import { loaded } from "./helpers/waits";

// The header's search, signed out: it finds the site's pages and the skills tests once typing
// pauses, lists what it found (or that nothing was), and picking a result by click or by keys
// opens it, closing the list and emptying the field. On phones a magnifier opens it in a bar
// under the header. Signed in it also finds the user's own companies (signed-in suite,
// zz-header-search.spec.ts).

// How long typing must pause before it searches (frontend config/lists.ts SEARCH_DELAY_MS).
const SEARCH_DELAY_MS = 500;

/** The header's search field that shows (on phones only once the magnifier opened it). */
function field(page: Page) {
  return page.getByRole("banner").getByRole("combobox").filter({ visible: true });
}

function results(page: Page) {
  return page.locator('[data-slot="search-results"]');
}

/** What the site's search finds for `q`, best first. */
async function siteResults(page: Page, q: string) {
  const response = await page.request.get(`${REQUEST_URL}/api/site/search?q=${q}`);

  return (await response.json()) as { title: string; path: string }[];
}

test("a skills test found is opened by a click, closing and emptying the search", async ({
  page,
  addTemplate,
}) => {
  const template = await addTemplate();
  await page.goto("/faq");
  await loaded(page);

  await field(page).fill(template.title);
  const option = results(page).getByRole("option");
  await expect(option).toHaveCount(1);
  await expect(option).toContainText(template.title);
  // Each result says what it is.
  await expect(option.locator("span").last()).not.toBeEmpty();

  await option.click();
  await expect(page).toHaveURL(new RegExp(`/tests/${template.slug}$`));
  await expect(results(page)).toHaveCount(0);
  await expect(field(page)).toHaveValue("");
});

test("a page found is opened from the keyboard", async ({ page }) => {
  const [best] = await siteResults(page, "pricing");
  expect(best).toBeTruthy();
  await page.goto("/faq");
  await loaded(page);

  await field(page).fill("pricing");
  await expect(results(page).getByRole("option").first()).toContainText(best.title);
  await field(page).press("ArrowDown");
  await field(page).press("Enter");
  await expect(page).toHaveURL((url) => `${url.pathname}${url.hash}` === best.path);
  await expect(results(page)).toHaveCount(0);
  await expect(field(page)).toHaveValue("");
});

test("nothing found says so, and an empty field shows no list", async ({ page }) => {
  await page.goto("/faq");
  await loaded(page);

  await field(page).fill(`no-such-page-${randomUUID().slice(0, 8)}`);
  await expect(results(page)).toBeVisible();
  await expect(results(page)).not.toBeEmpty();
  await expect(results(page).getByRole("option")).toHaveCount(0);

  await field(page).fill("");
  await expect(results(page)).toHaveCount(0);
});

test("it searches only once typing pauses", async ({ page }) => {
  await page.clock.install();
  await page.goto("/faq");
  await loaded(page);
  await pauseClock(page);
  const asked: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/site/search")) {
      asked.push(new URL(request.url()).searchParams.get("q") ?? "");
    }
  });

  await field(page).pressSequentially("pric");
  await page.clock.runFor(SEARCH_DELAY_MS - 100);
  await field(page).pressSequentially("ing");
  await page.clock.runFor(SEARCH_DELAY_MS - 100);
  expect(asked).toEqual([]);

  await page.clock.runFor(SEARCH_DELAY_MS);
  await expect.poll(() => asked).toEqual(["pricing"]);
  await expect(results(page).getByRole("option").first()).toBeVisible();
});

test("on a phone the magnifier opens the search under the header", { tag: "@phone-only" }, async ({
  page,
  addTemplate,
}) => {
  const template = await addTemplate();
  await page.goto("/faq");
  await loaded(page);
  const magnifier = page.getByRole("banner").locator("button[aria-pressed]").filter({ visible: true });
  await expect(magnifier).toHaveAccessibleName(/.+/);
  await expect(field(page)).toHaveCount(0);

  // It opens focused, and a tap anywhere else closes it.
  await magnifier.click();
  await expect(magnifier).toHaveAttribute("aria-pressed", "true");
  await expect(field(page)).toBeFocused();
  const fieldBox = (await field(page).boundingBox())!;
  const headerBox = (await page.getByRole("banner").boundingBox())!;
  expect(fieldBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1);
  await page.getByRole("main").locator("h1").click();
  await expect(field(page)).toHaveCount(0);
  await expect(magnifier).toHaveAttribute("aria-pressed", "false");

  // A result picked opens its page and closes the bar.
  await magnifier.click();
  await field(page).fill(template.title);
  await results(page).getByRole("option").first().click();
  await expect(page).toHaveURL(new RegExp(`/tests/${template.slug}$`));
  await expect(field(page)).toHaveCount(0);
});
