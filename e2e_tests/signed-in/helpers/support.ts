import { expect, type Locator, type Page } from "@playwright/test"

import { visit } from "./navigation"

/** Searches the admin zone's support tab for `query` (it searches as it's typed); the links of
 * what it found, in order, once the API has answered that query. Typed before the page has
 * hydrated, the text would be lost, so it's emptied and typed again until the search goes out.
 * The wait for the answer and the typing are awaited together: a wait that gave up while a slow
 * fill was still going would otherwise fail the test on its own, and its clean-up would delete
 * the test's company under the search still running (a candidate's search then found nothing). */
export async function supportSearch(page: Page, query: string) {
  await visit(page, "/superadmin/support")
  const box = page.getByRole("main").getByRole("searchbox")

  await expect(async () => {
    await box.fill("")
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/support/search") &&
          response.request().postDataJSON()?.query === query.trim(),
        { timeout: 15_000 }
      ),
      box.fill(query),
    ])
  }).toPass({ timeout: 90_000 })

  return page.getByRole("main").getByRole("list").getByRole("link")
}

/** The links on the page that open `kind`'s support page ("companies", "interviews",
 * "candidates" or "users"), the one of `id` when given. */
export function supportLink(page: Page, kind: string, id = "") {
  const end = id ? `$="/superadmin/support/${kind}/${id}"` : `*="/superadmin/support/${kind}/"`

  return page.locator(`main a[href${end}]`)
}

/** The id at the end of a support page link. */
export async function supportId(link: Locator) {
  const href = await link.getAttribute("href")

  return (href ?? "").split("/").pop() ?? ""
}
