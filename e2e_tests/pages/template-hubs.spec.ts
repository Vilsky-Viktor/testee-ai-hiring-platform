import type { APIRequestContext } from "@playwright/test";

import { REQUEST_URL } from "./helpers/env";
import { expect, test } from "./helpers/templates";

// The public hubs as crawlers get them: plain links to numbered pages that reach every indexable
// role by title, thin templates left out of them but still found by a search, and each numbered
// page its own canonical address. Checked on the test's own throwaway templates.

const PAGE_SIZE = 20;

type Page = { html: string; rows: string[]; next: string[] };

/** A hub page's HTML, as served, with the roles it links and its numbered pages. */
async function read(request: APIRequestContext, base: string, path: string): Promise<Page> {
  const response = await request.get(`${REQUEST_URL}${path}`);
  expect(response.status(), path).toBe(200);
  const html = await response.text();
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);

  return {
    html,
    rows: links.filter((href) => href.startsWith(`${base}/`)).map((href) => href.slice(base.length + 1)),
    next: links.filter((href) => href.startsWith(`${base}?page=`)),
  };
}

/** The roles reached by following the numbered links from the hub's first page. */
async function crawl(request: APIRequestContext, base: string) {
  const first = await read(request, base, base);
  const pages = await Promise.all(first.next.map((path) => read(request, base, path)));

  return { first, rows: [first, ...pages].flatMap((page) => page.rows) };
}

for (const base of ["/tests", "/practice"]) {
  test(`${base} links every indexable role from numbered pages, thin ones only by search`, async ({
    page,
    request,
    addTemplate,
  }) => {
    test.setTimeout(120_000);
    const made = [];

    for (let index = 0; index <= PAGE_SIZE; index += 1) {
      made.push(await addTemplate());
    }

    const thin = await addTemplate("en", 1);

    // Other tests' templates may come and go during a walk, so it's repeated until it holds.
    await expect(async () => {
      const { first, rows } = await crawl(request, base);
      // A whole page is in the HTML, and page two exists as a plain link.
      expect(new Set(first.rows).size).toBe(PAGE_SIZE);
      expect(first.next).toContain(`${base}?page=2`);
      expect(rows).toEqual(expect.arrayContaining(made.map((template) => template.slug)));
      expect(rows).not.toContain(thin.slug);
    }).toPass();

    await page.goto(`${base}?q=${encodeURIComponent(thin.title)}`);
    await expect(page.getByRole("main").locator(`a[href="${base}/${thin.slug}"]`).filter({ visible: true })).toBeVisible();
    // A searched list has no numbered pages.
    await expect(page.getByRole("main").locator(`a[href^="${base}?page="]`)).toHaveCount(0);
  });
}

test("a numbered page is its own canonical address and marks itself; a page past the last isn't found", async ({
  page,
  request,
  addTemplate,
}) => {
  test.setTimeout(120_000);

  for (let index = 0; index <= PAGE_SIZE; index += 1) {
    await addTemplate();
  }

  const second = await read(request, "/tests", "/tests?page=2");
  const canonical = second.html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  expect(canonical).toMatch(/\/tests\?page=2$/);
  // Each language's pages list other rows, so a numbered page names no language versions.
  expect(second.html).not.toContain('rel="alternate" hrefLang');

  await page.goto("/tests?page=2");
  const links = page.getByRole("main").getByRole("navigation").getByRole("link");
  await expect(links.nth(1)).toHaveAttribute("aria-current", "page");
  await expect(links.first()).not.toHaveAttribute("aria-current", "page");
  await expect(links.first()).toHaveAttribute("href", "/tests");
  await links.first().click();
  await expect(page).toHaveURL(/\/tests$/);

  const past = await page.request.get(`${REQUEST_URL}/tests?page=99999`);
  expect(past.status()).toBe(404);
});
