import type { Page } from "@playwright/test"

import { expect, test } from "../fixtures"
import { api, createCompany, createInterview, inviteCandidate } from "../helpers/api"
import { visit } from "../helpers/navigation"
import { ownerEmail, randomId, throwawayEmail } from "../helpers/users"

test.setTimeout(180_000)

/** A company named with `word`, an interview titled with it and a candidate whose email holds
 * it, made by the user signed in on `owner`. */
async function findable(owner: Page, word: string, side: string) {
  const company = await createCompany(owner, `E2E ${word} ${side} company`)
  const interviewId = await createInterview(owner, company.id)
  const interview = `${word} ${side} interview`
  await api(owner, "PATCH", `/companies/interviews/${interviewId}/title`, { title: interview })
  const email = throwawayEmail(`${word}-${side}`)
  await inviteCandidate(owner, interviewId, email)

  return { company, interviewId, interview, email }
}

// Signed in, the header's search also finds the user's own companies, interviews and candidates,
// in that order, a candidate's company and interview under it, and never another user's; picking
// one opens its page. What signed-out visitors find: pages/header-search.spec.ts.
test("the header's search finds the user's own companies, interviews and candidates only", async ({
  signInAs,
}) => {
  const word = `hs${randomId()}`
  const owner = await signInAs(ownerEmail())
  const other = await signInAs(ownerEmail())
  const own = await findable(owner, word, "own")
  await findable(other, word, "other")

  await visit(owner, "/companies")
  const field = owner.getByRole("banner").getByRole("combobox").filter({ visible: true })
  const options = owner.locator('[data-slot="search-results"]').getByRole("option")

  // Typed again if the page hadn't hydrated yet.
  await expect(async () => {
    await field.fill("")
    await field.fill(word)
    await expect(options).toHaveCount(3, { timeout: 5_000 })
  }).toPass({ timeout: 60_000 })
  await expect(options.nth(0)).toContainText(own.company.name)
  await expect(options.nth(1)).toContainText(own.interview)
  await expect(options.nth(1)).toContainText(own.company.name)
  await expect(options.nth(2)).toContainText(own.email)
  await expect(options.nth(2)).toContainText(own.company.name)
  await expect(options.nth(2)).toContainText(own.interview)
  await expect(options.filter({ hasText: "other" })).toHaveCount(0)

  await options.nth(2).click()
  await expect(owner).toHaveURL(
    new RegExp(`/companies/${own.company.id}/interviews/${own.interviewId}/candidates/[^/?]+$`)
  )
  await expect(owner.getByText(own.email).filter({ visible: true }).first()).toBeVisible()
  await expect(field).toHaveValue("")
})
