import type { Page } from "@playwright/test"

import { expect, test } from "../fixtures"
import { api, createCompany } from "../helpers/api"
import { sealWebhookSecretsElsewhere } from "../helpers/db"
import { visit } from "../helpers/navigation"
import { shot } from "../helpers/screenshots"
import { ownerEmail } from "../helpers/users"

// What a send says when testee can't read the web hook's secret.
const NOT_SENT = "Not sent: a problem on testee's side."

// Sends the web hook on its page a test event, clicking again if the click came before the page
// was ready for it, and waits for the answer.
async function sendTest(page: Page) {
  await expect(async () => {
    await page.getByTestId("webhook-test").click()
    await expect(page.getByTestId("test-result")).toBeVisible({ timeout: 10_000 })
  }).toPass()
}

// An owner sends a web hook a signed test event from its page and reads how it went in its
// delivery log.
test("an owner tests a web hook and reads its delivery log", async ({ signInAs }) => {
  const owner = await signInAs(ownerEmail())
  const company = await createCompany(owner)
  // A public address that doesn't take events: the log says what it answered.
  await api(owner, "POST", `/v1/manage/webhooks?company_id=${company.id}`, {
    url: "https://example.com/testee-webhook",
  })

  await visit(owner, `/companies/${company.id}/integrations/api?tab=webhooks`)
  await shot(owner, "webhooks")
  // The row opens its page, with the test's button; what came of it shows beside the button.
  await owner.getByTestId("webhook").getByRole("link").click()
  await expect(owner).toHaveURL(/\/integrations\/api\/webhooks\/[0-9a-f-]+$/)
  await sendTest(owner)
  await shot(owner, "tested")

  const log = owner.getByTestId("delivery-log").filter({ visible: true })
  await owner.reload()
  await expect(log.getByText("test", { exact: true })).toBeVisible()
  await shot(owner, "log")

  // Our key can't read the web hook's secret: the log says it's on testee's side, not theirs.
  await sealWebhookSecretsElsewhere(company.id)
  await sendTest(owner)
  await expect(owner.getByTestId("test-result")).toHaveAttribute("data-ok", "false")
  await expect(owner.getByTestId("test-result")).toHaveText(NOT_SENT)
  await owner.reload()
  await expect(log.getByText(NOT_SENT)).toBeVisible()
  await shot(owner, "log-unreadable")
})
