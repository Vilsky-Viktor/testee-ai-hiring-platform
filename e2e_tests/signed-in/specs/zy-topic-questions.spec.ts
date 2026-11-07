import type { Locator, Page } from "@playwright/test"

import { expect, test } from "../fixtures"
import { api, createCompany } from "../helpers/api"
import { addTemplate } from "../helpers/db-library"
import { PHONE } from "../helpers/layout"
import { visit } from "../helpers/navigation"
import { shot } from "../helpers/screenshots"
import { ownerEmail, randomId } from "../helpers/users"

type Detail = { topics: { id: string; question_count: number }[] }

/** An interview made from a throwaway template of 12 questions in one topic, in a new company. */
async function interviewFrom(owner: Page, template: string) {
  const company = await createCompany(owner)
  const interview = await api<{ id: string }>(
    owner,
    "POST",
    `/companies/interviews/from-template?company_id=${company.id}`,
    { template_id: template },
  )
  const detail = await api<Detail>(owner, "GET", `/companies/interviews/${interview.id}`)

  return {
    companyId: company.id,
    interviewId: interview.id,
    topicId: detail.topics[0].id,
    path: `/companies/${company.id}/interviews/${interview.id}`,
  }
}

/** Clicks a like or dislike and waits for its vote to be saved (`method`: PUT, or DELETE when
 * taken back): a click while the last one is saving is ignored. */
async function vote(page: Page, button: Locator, method: "PUT" | "DELETE") {
  const saved = page.waitForResponse(
    (response) => response.url().endsWith("/rating") && response.request().method() === method,
  )
  await button.click()
  expect((await saved).ok()).toBe(true)
}

/** The number a like, dislike or reports button shows. */
async function countOf(button: Locator) {
  return Number((await button.textContent())?.match(/\d+/)?.[0])
}

/** Opens the first question's reports and adds one through the report dialog: the first reason,
 * with `details`. The add button is then disabled and the list holds one report more. */
async function addReport(page: Page, row: Locator, details: string) {
  const reportsButton = row.locator("button[aria-expanded]:not([aria-haspopup])")
  const reportsBefore = await countOf(reportsButton)
  await reportsButton.click()
  await expect(reportsButton).toHaveAttribute("aria-expanded", "true")
  const panel = row.getByTestId("question-reports")
  const add = panel.getByRole("button").first()
  await expect(add).toBeEnabled()
  const entries = panel.locator("time")
  // Loaded: the empty list's sentence or the reports already there.
  await expect(panel.getByRole("status")).toHaveCount(0)
  const entriesBefore = await entries.count()

  await add.click()
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("button").first().click()
  await page.getByRole("menu").getByRole("menuitemradio").first().click()
  await dialog.getByRole("textbox").fill(details)
  await dialog.locator('button[type="submit"]').click()
  await expect(dialog).toHaveCount(0)

  await expect(add).toBeDisabled()
  await expect(entries).toHaveCount(entriesBefore + 1)
  await expect(panel.getByText(details)).toBeVisible()
  expect(await countOf(reportsButton)).toBe(reportsBefore + 1)
}

// An owner opens a topic's questions on their page: leaves a question out of the interview and
// brings it back, likes, takes back and dislikes it, and reports it.
test("an owner manages a topic's questions on their page", async ({ signInAs }) => {
  const template = await addTemplate(`E2E topic page ${randomId()}`, 12)

  const owner = await signInAs(ownerEmail())
  const { interviewId, topicId, path } = await interviewFrom(owner, template)
  const limit = owner.getByRole("main").getByRole("spinbutton").first()

  // From the Topics tab: the topic's button links to its page.
  await visit(owner, path)
  await expect(limit).toHaveAttribute("max", "12")
  await owner.getByTestId("manage-questions").first().click()
  await expect(owner).toHaveURL(new RegExp(`/topics/${topicId}$`))
  const row = owner.getByTestId("question-row").first()
  const include = row.getByRole("checkbox")
  await expect(include).toHaveAttribute("aria-checked", "true")
  await expect(include).toBeEnabled()
  await shot(owner, "topic-questions")

  // Disabled: saved, so it stays out after a reload and the topic counts one question less.
  await include.click()
  await expect(include).toHaveAttribute("aria-checked", "false")
  await expect
    .poll(async () => {
      const detail = await api<Detail>(owner, "GET", `/companies/interviews/${interviewId}`)

      return detail.topics[0].question_count
    })
    .toBe(11)
  await owner.reload()
  await expect(include).toHaveAttribute("aria-checked", "false")
  await shot(owner, "question-disabled")
  // The back link, to the interview's Topics tab.
  await owner.getByRole("main").locator(`a[href$="${path}"]`).first().click()
  await expect(limit).toHaveAttribute("max", "11")

  // Enabled again: the count is back.
  await owner.getByTestId("manage-questions").first().click()
  await expect(include).toHaveAttribute("aria-checked", "false")
  await include.click()
  await expect(include).toHaveAttribute("aria-checked", "true")
  await expect
    .poll(async () => {
      const detail = await api<Detail>(owner, "GET", `/companies/interviews/${interviewId}`)

      return detail.topics[0].question_count
    })
    .toBe(12)
  await owner.getByRole("main").locator(`a[href$="${path}"]`).first().click()
  await expect(limit).toHaveAttribute("max", "12")

  // Like, the same again to take it back, then dislike.
  await owner.getByTestId("manage-questions").first().click()
  const [like, dislike] = [
    row.locator("button[aria-pressed]").nth(0),
    row.locator("button[aria-pressed]").nth(1),
  ]
  await expect(like).toHaveAttribute("aria-pressed", "false")
  const likes = await countOf(like)
  const dislikes = await countOf(dislike)
  await vote(owner, like, "PUT")
  await expect(like).toHaveAttribute("aria-pressed", "true")
  await expect.poll(() => countOf(like)).toBe(likes + 1)
  await vote(owner, like, "DELETE")
  await expect(like).toHaveAttribute("aria-pressed", "false")
  await expect.poll(() => countOf(like)).toBe(likes)
  await vote(owner, dislike, "PUT")
  await expect(dislike).toHaveAttribute("aria-pressed", "true")
  await expect(like).toHaveAttribute("aria-pressed", "false")
  await expect.poll(() => countOf(dislike)).toBe(dislikes + 1)
  // Saved: still the dislike after a reload.
  await owner.reload()
  await expect(dislike).toHaveAttribute("aria-pressed", "true")
  await expect.poll(() => countOf(dislike)).toBe(dislikes + 1)
  await expect.poll(() => countOf(like)).toBe(likes)

  await addReport(owner, row, `Owner details ${randomId()}`)
  await shot(owner, "question-reported")

  // Phone: the checkbox stays on screen, at its row's side.
  await owner.setViewportSize(PHONE)
  await expect(include).toBeInViewport()
  await shot(owner, "topic-questions-phone")
})

// A viewer member sees whether each question is in the interview without changing it, and likes
// and reports questions as any member does.
test("a viewer likes and reports a topic's questions but can't disable them", async ({
  signInAs,
}) => {
  const template = await addTemplate(`E2E topic viewer ${randomId()}`, 12)

  const owner = await signInAs(ownerEmail())
  const { companyId, topicId, path } = await interviewFrom(owner, template)
  const viewerAddress = ownerEmail()
  const invited = await api<{ token: string }>(
    owner,
    "POST",
    `/companies/members?company_id=${companyId}`,
    { email: viewerAddress, role: "viewer" },
  )
  const viewer = await signInAs(viewerAddress)
  await api(viewer, "POST", `/companies/members/invites/${invited.token}/accept`)

  await visit(viewer, path)
  await viewer.getByTestId("manage-questions").first().click()
  await expect(viewer).toHaveURL(new RegExp(`/topics/${topicId}$`))
  const row = viewer.getByTestId("question-row").first()
  const include = row.getByRole("checkbox")
  await expect(include).toHaveAttribute("aria-checked", "true")
  await expect(include).toBeDisabled()
  await shot(viewer, "viewer-topic-questions")

  const like = row.locator("button[aria-pressed]").first()
  const likes = await countOf(like)
  await vote(viewer, like, "PUT")
  await expect(like).toHaveAttribute("aria-pressed", "true")
  await expect.poll(() => countOf(like)).toBe(likes + 1)

  await addReport(viewer, row, `Viewer details ${randomId()}`)
})
