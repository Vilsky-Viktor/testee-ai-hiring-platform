import { expect, test } from "../fixtures";
import { createCompany } from "../helpers/api";
import { openTopUpPage } from "../helpers/paddle";
import { shot } from "../helpers/screenshots";
import { ownerEmail } from "../helpers/users";

// A top-up's checkout is made by the backend (whose wallet it pays into can't be changed in the
// browser) and opens in Paddle's overlay. Needs Paddle's sandbox keys and prices in .env.
test("a top-up opens the checkout the backend made", async ({ signInAs }) => {
  const owner = await signInAs(ownerEmail());
  const company = await createCompany(owner);

  const buy = await openTopUpPage(owner, company.id);
  test.skip(await buy.isDisabled(), "Paddle's prices aren't set");

  const made = owner.waitForResponse((response) =>
    response.url().endsWith(`/companies/${company.id}/billing/checkout`),
  );
  await buy.click();
  const response = await made;

  expect(response.status()).toBe(200);
  expect((await response.json()).transaction_id).toMatch(/^txn_/);
  await expect(owner.locator("iframe.paddle-frame")).toBeVisible({
    timeout: 30_000,
  });
  // Paddle's form has loaded in it.
  await expect(
    owner.frameLocator("iframe.paddle-frame").locator("input, button").first(),
  ).toBeVisible({ timeout: 30_000 });
  await shot(owner, "paddle-checkout");
});
