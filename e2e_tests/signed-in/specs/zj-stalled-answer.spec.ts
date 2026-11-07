import { expect, test } from "../fixtures"
import { api, createCompany, inviteCandidate } from "../helpers/api"
import { inviteToken } from "../helpers/db"
import { deleteTemplate, multiAnswerTemplate } from "../helpers/db-library"
import { visit } from "../helpers/navigation"
import { ownerEmail, randomId, throwawayEmail } from "../helpers/users"

// A candidate on a bad connection: an answer that never gets a reply gives the controls back with
// an error, the pick still on screen.
test("a stalled answer gives the candidate's controls back", async ({ signInAs }) => {
  test.setTimeout(120_000)
  const template = await multiAnswerTemplate(`E2E stalled ${randomId()}`)

  try {
    const owner = await signInAs(ownerEmail())
    const company = await createCompany(owner)
    const interview = await api<{ id: string }>(
      owner,
      "POST",
      `/companies/interviews/from-template?company_id=${company.id}`,
      { template_id: template },
    )
    await api(owner, "PATCH", `/companies/interviews/${interview.id}/settings`, {
      question_seconds: 300,
    })
    const email = throwawayEmail("stalled-candidate")
    await inviteCandidate(owner, interview.id, email)
    const candidate = await signInAs(email)
    const { sessions } = await api<{ sessions: { id: string }[] }>(
      candidate,
      "POST",
      `/companies/invites/${await inviteToken(email)}/start`,
      { pledged: true },
    )
    await visit(candidate, `/sessions/${sessions[0].id}`)

    const main = candidate.getByRole("main")
    const option = main.getByRole("button", { name: /^[A-D]\s/ }).first()
    await expect(option).toBeVisible()
    await candidate.route("**/api/rounds/sessions/*/answers", () => undefined)
    await option.click()
    const next = candidate.getByTestId("next-question")
    await next.click()

    await expect(candidate.locator('[data-sonner-toast][data-type="error"]')).toBeVisible({
      timeout: 30_000,
    })
    await expect(next).toBeEnabled()
    await expect(option).toHaveAttribute("aria-pressed", "true")
  } finally {
    await deleteTemplate(template)
  }
})
