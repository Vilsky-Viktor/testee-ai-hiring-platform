import { expect, test } from "../fixtures"
import { createCompany, inviteCandidate } from "../helpers/api"
import { addTopUp, inviteToken, verifyCompany } from "../helpers/db"
import { exampleEmail, PEOPLE, spreadSections, takePart } from "../helpers/feature-people"
import {
  FLOW_TOPICS,
  pair,
  reachMultiAnswer,
  roleInterview,
  SHOT_VIEWPORT,
  topicsInReview,
} from "../helpers/feature-shots"
import { openDialog, visit } from "../helpers/navigation"
import { ownerEmail, throwawayEmail } from "../helpers/users"

// The job description pasted on the new interview page in the hiring flow's first picture.
const SHOT_DESCRIPTION = `Senior Accountant, Northwind Labs (hybrid, Amsterdam)

We're looking for a senior accountant to own our month-end close, reconciliations and VAT returns across three EU entities, under IFRS.

You'll prepare the management accounts, work with our auditors on the year-end, and keep our controls in Xero and Excel tidy as we grow.`

// The hiring flow's role, from the local template made for it.
const FLOW_ROLE = "Senior Accountant"
const FLOW_TEMPLATE = "Senior Accountant"

// The hiring flow page's pictures of the real app (helpers/feature-shots.ts): taken only with
// SHOTS=1, at twice the pixels, with made-up people; nothing here checks the product.
test.skip(process.env.SHOTS !== "1", "Pictures for the hiring flow page, taken with SHOTS=1 only")
test.use({ deviceScaleFactor: 2, viewport: SHOT_VIEWPORT })

// The hiring flow's first step: the new interview page's box with a job description pasted.
test("hiring flow: a job description", async ({ signInAs }) => {
  const owner = await signInAs(ownerEmail(), undefined, "Alex Morgan")
  const company = await createCompany(owner, "Northwind Labs")
  await visit(owner, `/companies/${company.id}/interviews/new`)
  await owner.getByRole("main").getByRole("textbox").first().fill(SHOT_DESCRIPTION)
  await pair(owner, "create")
})

// The hiring flow page's pictures (flow-*), all of one senior accountant's interview at
// Northwind Labs: its topics and one topic's questions, its settings, the invite dialog, the page
// a candidate starts from, the candidates, the best one's report and sharing it.
test("hiring flow: an accountant's interview", async ({ signInAs }) => {
  test.setTimeout(900_000)
  const owner = await signInAs(ownerEmail(), undefined, "Alex Morgan")
  const company = await createCompany(owner, "Northwind Labs")
  // No logo: the made-up logo is Lumen Health's.
  await verifyCompany(company.id, "northwindlabs.example")
  await addTopUp(company.id, 20_000, 20_000)
  const interviewId = await roleInterview(owner, company.id, FLOW_ROLE, FLOW_TEMPLATE)
  const base = `/companies/${company.id}/interviews/${interviewId}`

  // Each person's invite, in PEOPLE's order; the second's has the best grade.
  const inviteIds: string[] = []

  for (const person of PEOPLE) {
    inviteIds.push(await takePart(signInAs, owner, interviewId, person))
  }

  // The best candidate's topics each with a grade of their own.
  await spreadSections(inviteIds[1], [0.83, 0.67, 1, 0.83, 1, 0.67, 1, 0.83, 1])

  // The topics' review, on a second interview whose topics wait for it.
  const reviewedId = await roleInterview(owner, company.id, FLOW_ROLE, FLOW_TEMPLATE)
  const generationId = await topicsInReview(reviewedId, company.id)
  await visit(owner, `/generate/${generationId}?next=/companies/${company.id}/interviews/${reviewedId}`)
  await expect(owner.getByRole("main").getByText(FLOW_TOPICS[0].main_topic).first()).toBeVisible()
  // One topic open in its editor, as a reviewer changes it.
  await owner.getByRole("button", { name: new RegExp(FLOW_TOPICS[1].main_topic) }).click()
  await expect(owner.getByRole("textbox", { name: /topic/i }).first()).toBeVisible()
  await pair(owner, "flow-review")

  await visit(owner, base)
  await expect(owner.getByTestId("manage-questions").first()).toBeVisible()
  await openDialog(owner, owner.getByTestId("manage-questions").first())
  await expect(owner.getByRole("dialog").getByRole("listitem").first()).toBeVisible()
  await pair(owner, "flow-questions")
  await owner.keyboard.press("Escape")

  await visit(owner, `${base}?tab=settings`)
  await expect(owner.getByRole("main").getByTestId("answer-mode").filter({ visible: true })).toBeVisible()
  await pair(owner, "flow-settings")

  await visit(owner, `${base}?tab=candidates`)
  await expect(owner.getByText(exampleEmail("Maya Chen")).first()).toBeVisible()
  await pair(owner, "flow-candidates")
  await openDialog(owner, owner.getByTestId("new-candidate").filter({ visible: true }))
  const dialog = owner.getByRole("dialog")
  await dialog.getByRole("tab").first().click()
  await dialog.locator('input[type="email"]').fill(exampleEmail("Nina Patel"))
  await dialog.getByRole("textbox", { name: /name/i }).fill("Nina Patel")
  await pair(owner, "flow-invite")
  await owner.keyboard.press("Escape")

  // The report on a taller window, so its grade and each topic's result fit in one picture.
  await owner.setViewportSize({ width: SHOT_VIEWPORT.width, height: 2400 })
  await visit(owner, `${base}/candidates/${inviteIds[1]}`)
  await expect(owner.getByRole("main").getByText(/%/).first()).toBeVisible()
  // The picture is about the grade and each topic's result: the questions to ask in a live
  // interview, between them, are left out of it.
  await owner.getByTestId("answer-patterns").filter({ visible: true }).evaluate((section) => {
    section.style.display = "none"
  })
  await pair(owner, "flow-report")
  await owner.setViewportSize(SHOT_VIEWPORT)
  await openDialog(owner, owner.getByRole("main").getByRole("button", { name: /share/i }).last())
  await pair(owner, "flow-share")
  await owner.keyboard.press("Escape")

  const email = throwawayEmail("shot-flow")
  await inviteCandidate(owner, interviewId, email)
  const candidate = await signInAs(email, undefined, "Nina Patel")
  // In process, in click mode: a "select all that apply" question without an example, two of its
  // right options ticked.
  const { sessionId, right } = await reachMultiAnswer(candidate, await inviteToken(email))
  await visit(candidate, `/sessions/${sessionId}`)

  for (const option of right.slice(0, 2)) {
    const button = candidate.getByRole("main").locator("li > button[aria-pressed]").filter({ hasText: option })
    await button.click()
    await expect(button).toHaveAttribute("aria-pressed", "true")
  }

  await pair(candidate, "flow-question")
})
