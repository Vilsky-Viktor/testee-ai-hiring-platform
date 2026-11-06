import { expect, test } from "../fixtures";
import { api, createCompany } from "../helpers/api";
import { visit } from "../helpers/navigation";
import { shot } from "../helpers/screenshots";
import { ownerEmail, throwawayEmail } from "../helpers/users";

// A join link opened by someone signed in with another email: a warning to sign in with the
// invited one, and no Join button.
test("a join link warns a user signed in with another email", async ({
  signInAs,
}) => {
  const owner = await signInAs(ownerEmail());
  const company = await createCompany(owner);
  const member = await api<{ token: string }>(
    owner,
    "POST",
    `/companies/members?company_id=${company.id}`,
    { email: throwawayEmail("invited"), role: "viewer" },
  );

  const other = await signInAs(throwawayEmail("other"), { ui: true });
  await visit(other, `/join/${member.token}`);
  await expect(other.getByRole("heading", { name: company.name })).toBeVisible();
  await expect(other.getByRole("main").getByRole("status")).toContainText(
    "The email does not match. Sign in with the invitation email to join.",
  );
  await expect(other.getByRole("main").getByRole("button")).toHaveCount(0);
  await shot(other, "join-other-email");
});
