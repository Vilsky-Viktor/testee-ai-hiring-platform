import type { Page } from "@playwright/test"

import { expect, test } from "../fixtures"
import { api, createCompany } from "../helpers/api"
import { notifyCompany } from "../helpers/auto-top-up"
import { addRefund, addTopUp, addViewer, reserveCandidates } from "../helpers/db"
import { mailText, mailsTo } from "../helpers/mailpit"
import { visit } from "../helpers/navigation"
import { shot } from "../helpers/screenshots"
import { uidOf } from "../helpers/sign-in"
import { throwawayEmail } from "../helpers/users"

const PADDLE_REFUSED = "Paddle couldn't refund this top-up. Its credits are back in your balance."
const DOLLARS = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

type HistoryEntry = { refund?: { offer: { credits: number; amount: string } | null } }

// A company's own refund of a top-up, from its row in the history. Paddle sits behind billing, so
// its answer is mocked at the page's edge, on the refund's own route; the rows come from billing's
// database, as they do once Paddle has answered.
function refundRoute(companyId: string) {
  return `**/api/companies/companies/${companyId}/billing/refund`
}

function topUpRow(page: Page) {
  return page.getByRole("main").getByTestId("refund-top-up").filter({ visible: true })
}

async function openHistory(page: Page, companyId: string) {
  await visit(page, `/companies/${companyId}/billing?tab=history`)
}

test("a top-up's unspent credits are refunded after a confirmation", async ({ signInAs }) => {
  const owner = await signInAs(throwawayEmail("refund"))
  const company = await createCompany(owner)
  const transaction = await addTopUp(company.id, 5_000, 5_550)
  const asked: string[] = []

  await owner.route(refundRoute(company.id), async (route) => {
    asked.push(route.request().postDataJSON().transaction_id)
    await addRefund(company.id, transaction, 5_000, "approved")
    await route.fulfill({
      json: { status: "refunded", credits: 5_000, amount: "5550", currency: "USD" },
    })
  })

  await openHistory(owner, company.id)
  await topUpRow(owner).click()
  const dialog = owner.getByRole("dialog")
  await expect(dialog).toContainText("$55.50")
  await expect(dialog).toContainText("5K")
  await shot(owner, "refund-confirm")
  await dialog.getByRole("button").last().click()

  await expect(owner.locator('[data-sonner-toast][data-type="success"]')).toBeVisible()
  expect(asked).toEqual([transaction])
  await expect(owner.getByTestId("refund-status").first()).toHaveAttribute("data-status", "refunded")
  await expect(topUpRow(owner)).toHaveCount(0)
})

test("Paddle refusing shows why and leaves the top-up refundable", async ({ signInAs }) => {
  const owner = await signInAs(throwawayEmail("refund-refused"))
  const company = await createCompany(owner)
  await addTopUp(company.id, 5_000, 5_000)

  await owner.route(refundRoute(company.id), (route) =>
    route.fulfill({ status: 409, json: { detail: PADDLE_REFUSED } }),
  )

  await openHistory(owner, company.id)
  await topUpRow(owner).click()
  await owner.getByRole("dialog").getByRole("button").last().click()

  await expect(owner.locator('[data-sonner-toast][data-type="error"]')).toContainText(PADDLE_REFUSED)
  await expect(topUpRow(owner)).toBeVisible()
})

test("a refund on its way shows in its row, with nothing more to refund", async ({ signInAs }) => {
  const owner = await signInAs(throwawayEmail("refund-pending"))
  const company = await createCompany(owner)
  const transaction = await addTopUp(company.id, 5_000, 5_000)
  await addRefund(company.id, transaction, 5_000, "pending")

  await openHistory(owner, company.id)

  await expect(owner.getByTestId("refund-status").first()).toHaveAttribute(
    "data-status",
    "processing",
  )
  await expect(topUpRow(owner)).toHaveCount(0)
})

test("credits set aside for candidates are held back, with where to revoke them", async ({
  signInAs,
}) => {
  const owner = await signInAs(throwawayEmail("refund-held-back"))
  const company = await createCompany(owner)
  await addTopUp(company.id, 5_000, 5_000)
  // Enough candidates to reach what was paid for, with or without a welcome gift (once per inbox).
  await reserveCandidates(company.id, 4)
  const history = await api<HistoryEntry[]>(
    owner,
    "GET",
    `/companies/companies/${company.id}/billing/history`,
  )
  const offer = history.find((entry) => entry.refund?.offer)!.refund!.offer
  expect(offer.credits).toBeLessThan(5_000)

  await openHistory(owner, company.id)
  await topUpRow(owner).click()
  const dialog = owner.getByRole("dialog")

  await expect(dialog).toContainText(DOLLARS.format(Number(offer.amount) / 100))
  await expect(
    dialog.getByTestId("refund-held-back").locator('a[href$="?tab=reserved"]'),
  ).toBeVisible()
})

test("with all of a top-up reserved, its row says why instead of offering it", async ({
  signInAs,
}) => {
  const owner = await signInAs(throwawayEmail("refund-all-held"))
  const company = await createCompany(owner)
  await addTopUp(company.id, 1_000, 1_000)
  await reserveCandidates(company.id, 5)

  await openHistory(owner, company.id)

  await expect(
    owner.getByRole("main").getByTestId("refund-held-back").filter({ visible: true }),
  ).toContainText("2")
  await expect(topUpRow(owner)).toHaveCount(0)
})

for (const [kind, alert] of [
  ["refund_approved", false],
  ["refund_rejected", true],
] as const) {
  test(`${kind} reaches the bell and the email with the company and the amount`, async ({
    signInAs,
  }) => {
    const email = throwawayEmail("refund-notice")
    const owner = await signInAs(email)
    const company = await createCompany(owner)

    await notifyCompany(owner.request, company.id, kind, {
      credits: 5_000,
      price: 5_550,
      currency: "EUR",
    })

    await expect.poll(async () => (await mailsTo(owner.request, email)).length).toBe(1)
    const [mail] = await mailsTo(owner.request, email)
    expect(mail.Subject).toContain(company.name)
    expect(mail.Subject).toContain("€55.50")
    expect(await mailText(owner.request, mail.ID)).toContain(`/companies/${company.id}/billing`)

    await visit(owner, `/companies/${company.id}`)
    await owner.getByTestId("notifications").filter({ visible: true }).click()
    const item = owner.getByRole("menuitem").first()
    await expect(item).toContainText(company.name)
    await expect(item).toContainText("€55.50")
    await expect(item.locator("bdi")).toHaveText(company.name)
    expect(await item.getAttribute("data-alert")).toBe(alert ? "true" : null)
  })
}

test("a company's billing notices stay out of a viewer's bell", async ({ signInAs }) => {
  const owner = await signInAs(throwawayEmail("refund-owner"))
  const company = await createCompany(owner)
  const viewerEmail = throwawayEmail("refund-viewer")
  const viewer = await signInAs(viewerEmail)
  await addViewer(company.id, await uidOf(viewer), viewerEmail)

  await notifyCompany(owner.request, company.id, "refund_approved", {
    credits: 5_000,
    price: 5_550,
    currency: "USD",
  })
  await notifyCompany(owner.request, company.id, "referral_rewarded", { credits: 1_000 })

  // The company's other notice proves the viewer's bell reads this company.
  await expect(async () => {
    await visit(viewer, "/companies")
    await viewer.getByTestId("notifications").filter({ visible: true }).click()
    await expect(viewer.getByRole("menuitem")).toHaveCount(1, { timeout: 2_000 })
    await expect(viewer.getByRole("menuitem").first()).toContainText("1,000")
  }).toPass({ timeout: 90_000 })
  await expect(viewer.getByRole("menuitem").filter({ hasText: "$55.50" })).toHaveCount(0)

  await visit(owner, "/companies")
  await owner.getByTestId("notifications").filter({ visible: true }).click()
  await expect(owner.getByRole("menuitem").filter({ hasText: "$55.50" })).toHaveCount(1)
})
