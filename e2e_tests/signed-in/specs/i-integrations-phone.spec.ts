import type { Locator, Page } from "@playwright/test"

import { expect, test } from "../fixtures"
import { createCompany, createInterview } from "../helpers/api"
import { addAtsConnection, addSlackConnection, markAtsBroken } from "../helpers/db-integrations"
import { box, PHONE, settled } from "../helpers/layout"
import { integrationRow, openFromMenu, visit } from "../helpers/navigation"
import { shot } from "../helpers/screenshots"
import { throwawayEmail } from "../helpers/users"

/** The "⋮" of the page's integration sits at the end of its title's line. */
async function expectMenuBesideTitle(page: Page) {
  const title = await box(page.getByRole("heading", { level: 1 }))
  const menu = await box(actionsOf(page).getByTestId("integration-menu"))
  expect(menu.left).toBeGreaterThanOrEqual(title.right)
  expect(menu.top).toBeLessThan(title.bottom)
}

/** The page's own actions. */
function actionsOf(page: Page) {
  return page.getByRole("main").getByTestId("integration-actions")
}

/** A row's button (Connect, Reconnect) takes the line under its name, across the row, with the
 * "⋮" on the name's line. */
async function expectButtonOwnLine(row: Locator) {
  const button = await box(
    row.locator("[data-testid=integration-actions] button:not([data-testid=integration-menu])")
  )
  const menu = await box(row.getByTestId("integration-menu"))
  expect(button.top).toBeGreaterThan(menu.bottom)
  // Inside the row's 16px side padding.
  expect(button.width).toBeGreaterThanOrEqual((await box(row)).width - 34)
}

/** The Instructions dialog from `scope`'s "⋮" menu fills the screen's height. */
async function expectFullHeightDialog(page: Page, scope: Locator) {
  await openFromMenu(page, scope)
  await settled(page.getByRole("dialog"))
  const dialog = await box(page.getByRole("dialog"))
  expect(Math.abs(dialog.height - PHONE.height)).toBeLessThanOrEqual(2)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
}

// On a phone the integrations tab's rows have a small logo beside the name, their "⋮" at the end
// of that line and their button on the line under it; on Slack's, an ATS's and the API's pages
// the "⋮" stays beside the title, and the Instructions fill the screen. A connection that stopped
// working puts Reconnect on a line of its own.
test("the integrations pages on a phone", async ({ signInAs }) => {
  test.setTimeout(300_000)
  const owner = await signInAs(throwawayEmail("integrations-phone"))
  const company = await createCompany(owner)
  const interviewId = await createInterview(owner, company.id)
  const tab = `/companies/${company.id}/integrations`
  await addSlackConnection(company.id)
  await addAtsConnection(company.id, interviewId, { invited: 3, notInvited: 2 })
  // On a computer: each row's logo the row's full height, its buttons at the end of the line.
  await visit(owner, tab)
  await shot(owner, "tab-desktop")
  await owner.setViewportSize(PHONE)

  await visit(owner, tab)

  for (const path of ["/slack", "/workable", "/api", "/ai"]) {
    const row = integrationRow(owner, path)
    // The link's two parts: the logo, then the name and its text.
    const logo = await box(row.getByRole("link").locator("> span").first())
    const title = await box(row.getByRole("link").locator("> span").nth(1))
    const menu = await box(row.getByTestId("integration-menu"))
    expect(logo.width, path).toBe(48)
    expect(logo.height, path).toBe(48)
    expect(title.left, path).toBeGreaterThan(logo.right)
    expect(menu.left, path).toBeGreaterThanOrEqual(title.right)
    expect(menu.top, path).toBeLessThan(title.bottom)
  }

  // Not connected: Connect on the line under.
  await expectButtonOwnLine(integrationRow(owner, "/greenhouse"))
  await shot(owner, "tab")
  await expectFullHeightDialog(owner, integrationRow(owner, "/workable"))

  // Slack: the "⋮" beside the title; the notifications' box spans the screen, like a list.
  await visit(owner, `${tab}/slack`)
  await expectMenuBesideTitle(owner)
  const kinds = await box(
    owner.locator("main .divide-y").filter({ has: owner.getByRole("checkbox") })
  )
  expect(kinds.left).toBeLessThanOrEqual(0)
  // The header's right edge: the page's visible width, without the scrollbar desktop Chrome draws.
  expect(kinds.right).toBeGreaterThanOrEqual((await box(owner.getByRole("banner"))).right)
  await shot(owner, "slack")

  // Workable: the "⋮" beside the title, "Link a job" beside the linked jobs' title, and a linked
  // job's numbers on the line under its name, with its "⋮" on the name's line.
  await visit(owner, `${tab}/workable`)
  await expectMenuBesideTitle(owner)
  const linkJob = owner.getByTestId("link-job")
  const link = await box(linkJob)
  const linksTitle = await box(linkJob.locator("xpath=preceding-sibling::h2"))
  expect(link.left).toBeGreaterThan(linksTitle.right)
  expect(link.right).toBeLessThanOrEqual(PHONE.width)
  const row = owner.getByRole("main").getByRole("listitem").filter({ hasText: "E2E Backend developer" })
  const job = await box(row.getByText("E2E Backend developer"))
  const invited = await box(row.getByTestId("invited-count"))
  const unlink = await box(row.getByTestId("integration-menu"))
  expect(invited.top).toBeGreaterThan(job.bottom)
  // Above the numbers, beside the job's name and text.
  expect(unlink.bottom).toBeLessThanOrEqual(invited.top)
  await shot(owner, "workable")
  await expectFullHeightDialog(owner, actionsOf(owner))

  // A key that stopped working: Reconnect on its own line, under the page's warning and on the tab.
  await markAtsBroken(company.id)
  await owner.reload()
  const warning = owner.getByRole("main").getByRole("status")
  expect((await box(warning.getByRole("button"))).top).toBeGreaterThan(
    (await box(warning.getByRole("paragraph"))).bottom
  )
  await shot(owner, "workable-broken")
  await visit(owner, tab)
  await expectButtonOwnLine(integrationRow(owner, "/workable"))
  await shot(owner, "tab-broken")

  // The API: the docs in the "⋮" beside the title.
  await visit(owner, `${tab}/api`)
  await expectMenuBesideTitle(owner)
  await shot(owner, "api")
})
