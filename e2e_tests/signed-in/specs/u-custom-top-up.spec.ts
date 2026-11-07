import { expect, test } from "../fixtures"
import { api, createCompany } from "../helpers/api"
import { openTopUpPage, topUpTiers } from "../helpers/paddle"
import { shot } from "../helpers/screenshots"
import { throwawayEmail } from "../helpers/users"

// Any number of candidates, typed or chosen by where each price starts, priced from billing's
// catalog: the price to pay, credits and candidates, and the next
// level instead where it costs no more.
test("the top-up page prices any number of candidates", async ({ signInAs }) => {
  const owner = await signInAs(throwawayEmail("custom-top-up"))
  const company = await createCompany(owner)
  const buy = await openTopUpPage(owner, company.id)
  const count = owner.getByTestId("custom-count").filter({ visible: true })
  const quote = owner.getByTestId("custom-quote").filter({ visible: true })
  const upgraded = owner.getByTestId("custom-upgraded").filter({ visible: true })
  const tiers = topUpTiers(owner)

  await expect(count).toHaveValue("10")
  await expect(buy).toContainText("$50")
  await expect(quote).toContainText("10")
  await expect(quote).toContainText("5,000")
  await expect(upgraded).toHaveCount(0)

  // Any count in the first level, at its price.
  await count.fill("39")
  await expect(buy).toContainText("$195")
  await expect(tiers.first()).toHaveAttribute("aria-pressed", "true")
  await expect(upgraded).toHaveCount(0)

  // 40 at $5 would cost $200, what 50 at $4 cost: those 50 it is.
  await count.fill("40")
  await expect(buy).toContainText("$200")
  await expect(quote).toContainText("50")
  await expect(quote).toContainText("25,000")
  await expect(upgraded).toContainText("50")
  await expect(tiers.nth(1)).toHaveAttribute("aria-pressed", "true")
  await shot(owner, "next-level")

  await count.fill("1000")
  await expect(buy).toContainText("$2,000")
  await expect(tiers.last()).toHaveAttribute("aria-pressed", "true")

  // A choice sets the count to where its price starts.
  await tiers.nth(1).click()
  await expect(count).toHaveValue("50")
  await expect(buy).toContainText("$200")

  test.skip(await buy.isDisabled(), "Paddle's per-candidate prices aren't set")

  // Only digits go in. Out of range it can't be bought while typed, and comes back in range.
  await count.fill("5000")
  await expect(buy).toBeDisabled()
  await expect(buy).toContainText("$2,000")
  await count.blur()
  await expect(count).toHaveValue("1000")
  await expect(buy).toBeEnabled()
  await count.fill("3")
  await expect(buy).toBeDisabled()
  await count.blur()
  await expect(count).toHaveValue("10")

  // The button asks billing for the count shown; billing sets the price.
  await count.fill("4x5")
  await expect(count).toHaveValue("45")
  await expect(buy).toContainText("$200")

  const sent: unknown[] = []
  await owner.route("**/billing/checkout", (route) => {
    sent.push(route.request().postDataJSON())

    return route.fulfill({ status: 503, json: { detail: "Unavailable" } })
  })
  await buy.click()
  await expect(owner.locator("[data-sonner-toast][data-type=error]")).toBeVisible()
  expect(sent).toEqual([{ candidates: 50 }])
})

const AUTO_TOP_UP = {
  offered: true,
  waiting: false,
  products: ["topup_50", "topup_200"],
  thresholds: [500, 2000],
  currency: "USD",
  prices: { topup_50: 5000, topup_200: 20000 },
}

// Right to left (Arabic) the prices run from the right, and the count stays a number written left
// to right.
test("the top-up page runs right to left in Arabic", async ({ signInAs, signInWith }) => {
  const email = throwawayEmail("custom-top-up-rtl")
  const owner = await signInAs(email)
  const company = await createCompany(owner)
  // A new sign-in's token carries the account's new language.
  await api(owner, "PUT", "/accounts/me/settings", { language: "ar" })
  const arabic = await signInWith(email, false)
  await openTopUpPage(arabic, company.id)
  await expect(arabic.locator("html")).toHaveAttribute("dir", "rtl")
  await expect(arabic.getByTestId("custom-count").filter({ visible: true })).toHaveAttribute("dir", "ltr")
  const tiers = topUpTiers(arabic)

  expect((await tiers.first().boundingBox())!.x).toBeGreaterThan((await tiers.last().boundingBox())!.x)
  await shot(arabic, "rtl-top-up")
})

// Under the button, the automatic top-up as a card; its dialog saves only a change.
test("the automatic top-up card changes the setting it shows", async ({ signInAs }) => {
  const owner = await signInAs(throwawayEmail("custom-top-up-auto"))
  const company = await createCompany(owner)
  await owner.route("**/api/companies/companies/*/auto-top-up", (route) =>
    route.fulfill({
      json: { ...AUTO_TOP_UP, on: true, product: "topup_50", threshold: 500 },
    })
  )
  await openTopUpPage(owner, company.id)
  const card = owner.getByTestId("auto-top-up").filter({ visible: true })

  await expect(card.getByTestId("auto-top-up-on")).toContainText("$50")
  await expect(card.getByTestId("auto-top-up-on")).toContainText("500")
  // On, it's the setting as text with its edit icon, not the button that sets it up.
  await expect(card.getByTestId("set-up-auto-top-up")).toHaveCount(0)
  await card.getByRole("button").click()
  // The setup's dialog.
  const setup = owner.getByRole("dialog")
  await expect(setup.locator("form")).toBeVisible()
  const footer = setup.locator("[data-slot=dialog-footer]").getByRole("button")
  const save = setup.locator("button[type=submit]")

  // Turn off, Close and Save; nothing to save, and nothing to agree to, until something
  // changes.
  await expect(footer).toHaveCount(3)
  await expect(save).toBeDisabled()
  const agree = setup.getByTestId("auto-top-up-agree")
  await expect(agree).toHaveCount(0)
  const amount = setup.locator("form").getByRole("button").first()
  await expect(amount).toContainText("$50")
  await expect(amount).toContainText("10")
  await shot(owner, "auto-top-up")

  await amount.click()
  await owner.getByRole("menu").getByRole("menuitemradio").last().click()
  await expect(amount).toContainText("$200")
  await expect(amount).toContainText("50")
  // A change is saved only with the buyer's own tick on its new terms: the amount chosen and
  // the level it charges under.
  await expect(agree).not.toBeChecked()
  await expect(setup.locator("form label")).toContainText("$200")
  await expect(setup.locator("form label")).toContainText("500")
  await expect(save).toBeDisabled()
  await agree.click()
  await expect(save).toBeEnabled()
  await shot(owner, "auto-top-up-agreed")

  // Choosing again clears the tick, so it always agrees to what's shown.
  await amount.click()
  await owner.getByRole("menu").getByRole("menuitemradio").first().click()
  await expect(save).toBeDisabled()
  await expect(agree).toHaveCount(0)
})

test("an automatic top-up that's off is set up from its card", async ({ signInAs }) => {
  const owner = await signInAs(throwawayEmail("custom-top-up-off"))
  const company = await createCompany(owner)
  await owner.route("**/api/companies/companies/*/auto-top-up", (route) =>
    route.fulfill({
      json: { ...AUTO_TOP_UP, on: false, product: null, threshold: null },
    })
  )
  await openTopUpPage(owner, company.id)

  await owner.getByTestId("set-up-auto-top-up").filter({ visible: true }).click()
  const setup = owner.getByRole("dialog")
  await expect(setup.locator("form")).toBeVisible()

  // Close and Turn on, which needs no change but the buyer's own tick, never given beforehand.
  await expect(setup.locator("[data-slot=dialog-footer]").getByRole("button")).toHaveCount(2)
  const turnOn = setup.locator("button[type=submit]")
  const agree = setup.getByTestId("auto-top-up-agree")
  await expect(agree).not.toBeChecked()
  await expect(turnOn).toBeDisabled()
  await agree.click()
  await expect(turnOn).toBeEnabled()

  // The amount and the level are two pills picked from the site's menu, not the browser's.
  const pills = setup.locator("form").getByRole("button")
  await expect(pills).toHaveCount(2)
  await expect(owner.locator("select")).toHaveCount(0)

  for (const [index, name] of ["amount", "level"].entries()) {
    const pill = pills.nth(index)
    await pill.click()
    const items = owner.getByRole("menu").getByRole("menuitemradio")
    await expect(items.nth(1)).toBeVisible()
    await shot(owner, `menu-${name}`)
    // The option's first line: the amount (its candidates under it) or the level.
    const picked = (await items.last().innerText()).split("\n")[0]
    await items.last().click()
    await expect(owner.getByRole("menu")).toHaveCount(0)
    await expect(pill).toContainText(picked)
    // Another choice takes the tick away: it agreed to the one before.
    await expect(agree).not.toBeChecked()
    await expect(turnOn).toBeDisabled()
    await agree.click()
  }

  // What's saved carries the tick.
  const saved = owner.waitForRequest((request) => request.method() === "PUT")
  await turnOn.click()
  expect((await saved).postDataJSON()).toMatchObject({ product: "topup_200", agreed: true })
})
