import type { Locator, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import {
  api,
  createCompany,
  createInterview,
  inviteCandidate,
} from "../helpers/api";
import { openMenu, openTab, visit } from "../helpers/navigation";
import { shot } from "../helpers/screenshots";
import { ownerEmail, throwawayEmail } from "../helpers/users";

// The roles in the role menu's order (MEMBER_ROLES), as the API names them.
const ROLES = ["admin", "viewer"] as const;

/** Picks a role in the open role menu, which closes on the pick: left open, it would cover the
 * dialog's buttons. */
async function pickRole(page: Page, role: (typeof ROLES)[number]) {
  const menu = page.getByRole("menu");
  await menu.getByRole("menuitemradio").nth(ROLES.indexOf(role)).click();
  await expect(menu).toBeHidden();
  await shot(page, `role-picked-${role}`);
}

/** The member invited as `email`, as the API lists the company's members. */
async function member(page: Page, companyId: string, email: string) {
  const members = await api<
    { email: string; role: string; joined: boolean; token: string }[]
  >(
    page,
    "GET",
    `/companies/members?company_id=${companyId}`,
  );

  return members.find((item) => item.email === email);
}

// The team tab: a viewer invited and their role changed by the owner; the viewer then sees the
// company without the ways to change it, and can still download and share reports.
test("owner adds a viewer, who sees the company read-only", async ({
  browser,
  signInAs,
}) => {
  // Four browsers and many pages on the slow local dev server.
  test.setTimeout(300_000);
  const ownerAddress = ownerEmail();
  const owner = await signInAs(ownerAddress);
  const company = await createCompany(owner);
  const interviewId = await createInterview(owner, company.id);
  // A candidate, so the candidates tab has reports to download and share.
  await inviteCandidate(owner, interviewId, throwawayEmail("candidate"));
  const viewer = throwawayEmail("viewer");

  // Only the owner removes the company: in its row's menu.
  await visit(owner, "/companies");
  const companyRow = (page: Page) =>
    page.getByRole("listitem").filter({ hasText: company.name });
  await openMenu(owner, companyRow(owner).getByTestId("company-menu"));
  await expect(owner.getByTestId("remove-company")).toBeVisible();
  await shot(owner, "owner-companies");

  await visit(owner, `/companies/${company.id}/interviews`);
  await openTab(owner, "/members");
  await shot(owner, "team");
  // With only its owner, the page itself invites the first teammate.
  await expect(owner.getByTestId("add-member")).toHaveCount(0);
  const form = owner.getByRole("main").locator("form");
  await form.locator('input[type="email"]').fill(viewer);
  // The role select: a gray pill opening a menu of roles, the default one picked; the first
  // menu in a row, before the row's own.
  const rolePill = (scope: Locator) =>
    scope.locator('[aria-haspopup="menu"]').first();
  await rolePill(form).click();
  const menu = owner.getByRole("menu");
  await expect(menu.getByRole("menuitemradio")).toHaveCount(ROLES.length);
  await expect(menu.getByRole("menuitemradio").first()).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await shot(owner, "role-menu");
  await pickRole(owner, "viewer");
  await shot(owner, "first-member-form");
  await form.locator('button[type="submit"]').click();

  // The new row, among the invites waiting: invited as a viewer, its role select, its menu and
  // the way to copy the join link.
  const row = owner.getByTestId("pending-invites").filter({ hasText: viewer });
  await expect(row).toBeVisible();
  expect(await member(owner, company.id, viewer)).toMatchObject({
    role: "viewer",
    joined: false,
  });
  await expect(rolePill(row)).toBeVisible();
  await expect(row.getByTestId("copy-invite")).toBeVisible();
  await shot(owner, "member-row");

  // Inviting the same email again says why it isn't sent.
  await owner.getByTestId("add-member").click();
  await owner.getByRole("dialog").locator('input[type="email"]').fill(viewer);
  await owner.getByRole("dialog").locator('button[type="submit"]').click();
  await expect(
    owner.locator('[data-sonner-toast][data-type="error"]'),
  ).toContainText("That email is already invited");
  await owner.keyboard.press("Escape");
  await expect(row).toHaveCount(1);

  // Inviting their own email says why too (a conflict, as the service answers it), once the
  // first refusal's toast is gone.
  await expect(owner.locator("[data-sonner-toast]")).toHaveCount(0);
  await owner.getByTestId("add-member").click();
  await owner
    .getByRole("dialog")
    .locator('input[type="email"]')
    .fill(ownerAddress);
  await owner.getByRole("dialog").locator('button[type="submit"]').click();
  await expect(
    owner.locator('[data-sonner-toast][data-type="error"]'),
  ).toContainText("You're already a member");
  await owner.keyboard.press("Escape");

  // The role changes in place, and back.
  await rolePill(row).click();
  await pickRole(owner, "admin");
  await expect
    .poll(async () => (await member(owner, company.id, viewer))?.role)
    .toBe("admin");
  await shot(owner, "member-admin");
  await rolePill(row).click();
  await pickRole(owner, "viewer");
  await expect
    .poll(async () => (await member(owner, company.id, viewer))?.role)
    .toBe("viewer");

  // Removing them, in the row's menu, asks first, naming the member; kept here.
  await openMenu(owner, row.getByTestId("member-menu"));
  await owner.getByTestId("remove-member").click();
  await expect(owner.getByRole("dialog")).toContainText(viewer);
  await shot(owner, "remove-confirm");
  await owner.getByRole("dialog").getByRole("button").first().click();
  await expect(owner.getByRole("dialog")).toHaveCount(0);
  await expect(row).toBeVisible();

  const joinPath = `/join/${(await member(owner, company.id, viewer))?.token}`;

  // Before signing in, the link shows what it's for and a button to sign in, not the email.
  const context = await browser.newContext();

  try {
    const visitor = await context.newPage();
    await visit(visitor, joinPath);
    await expect(
      visitor.getByRole("heading", { name: company.name }),
    ).toBeVisible();
    await expect(visitor.getByText(viewer)).toHaveCount(0);
    await shot(visitor, "join-signed-out");
    // Its one button signs in.
    await visitor.getByRole("main").getByRole("button").click();
    await expect(visitor.getByRole("dialog")).toBeVisible();
  } finally {
    await context.close();
  }

  const page = await signInAs(viewer);
  await visit(page, joinPath);
  await shot(page, "join");
  await page.getByRole("main").getByRole("button").click();
  await expect(page).toHaveURL(/\/companies$/);
  await expect(page.getByText(company.name).first()).toBeVisible();
  expect(await member(owner, company.id, viewer)).toMatchObject({
    joined: true,
  });

  // Reopening the used link opens the company, rather than "invalid".
  await visit(page, joinPath);
  await expect(page.getByRole("heading", { name: company.name })).toBeVisible();
  await shot(page, "join-used-member");
  await page.getByRole("main").getByRole("button").click();
  await expect(page).toHaveURL(new RegExp(`/companies/${company.id}/interviews$`), {
    timeout: 60_000,
  });
  // Anyone else signed in is told it was used.
  const stranger = await signInAs(throwawayEmail("stranger"));
  await visit(stranger, joinPath);
  // A new browser loads the whole page's code from the local dev server first: it can be slow.
  await expect(stranger.getByText("This invite has already been used.").filter({ visible: true })).toBeVisible({
    timeout: 60_000,
  });
  await expect(stranger.getByRole("main").getByRole("button")).toHaveCount(0);
  await shot(stranger, "join-used-other");

  // The owner hears in the bell that they joined, and it opens the team.
  const joined = owner
    .getByRole("menuitem")
    .filter({ hasText: viewer })
    .filter({ hasText: company.name });
  await expect(async () => {
    await owner.reload();
    await owner.getByTestId("notifications").click();
    await expect(joined).toBeVisible({ timeout: 5000 });
  }).toPass({ timeout: 120_000 });
  await shot(owner, "bell-member-joined");
  await joined.click();
  await expect(owner).toHaveURL(
    new RegExp(`/companies/${company.id}/members$`),
  );
  // The viewer's companies: the row, its menu without the owner's remove.
  await visit(page, "/companies");
  await openMenu(page, companyRow(page).getByTestId("company-menu"));
  await expect(page.getByRole("menu").getByRole("menuitem").first()).toBeVisible();
  await expect(page.getByTestId("remove-company")).toHaveCount(0);
  await shot(page, "viewer-companies");
  await page.keyboard.press("Escape");
  await page.getByText(company.name).first().click();

  // Read-only: no New interview, the name isn't a button to rename it, no verify.
  await expect(page.getByRole("heading", { name: company.name })).toBeVisible();
  await expect(page.locator('a[href$="/interviews/new"]')).toHaveCount(0);
  await expect(page.getByRole("heading").getByRole("button")).toHaveCount(0);
  await expect(page.getByTestId("verify-company")).toHaveCount(0);
  await shot(page, "viewer-interviews");

  await visit(page, `/companies/${company.id}/interviews/${interviewId}`);
  await expect(page.getByTestId("manage-questions").first()).toBeVisible();
  await expect(page.getByRole("heading").getByRole("button")).toHaveCount(0);
  // No settings tab, and its address shows the interview instead.
  await expect(page.locator('main nav a[href$="?tab=settings"]')).toHaveCount(0);
  await shot(page, "viewer-interview");
  await visit(
    page,
    `/companies/${company.id}/interviews/${interviewId}?tab=settings`,
  );
  await expect(page.getByTestId("manage-questions").first()).toBeVisible();

  await visit(
    page,
    `/companies/${company.id}/interviews/${interviewId}?tab=candidates`,
  );
  // The page's menu keeps downloading and sharing the report (and trying the interview), with
  // no delete; the rows have no menu.
  await openMenu(page, page.getByRole("main").getByTestId("integration-menu"));
  await expect(page.getByRole("menu").getByRole("menuitem")).toHaveCount(3);
  await page.keyboard.press("Escape");
  // Gone, so the sort menu below is the only one.
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(page.getByTestId("new-candidate")).toHaveCount(0);
  await shot(page, "viewer-candidates");
  // A sort menu (the search's last menu: date, then grade) closes on the pick too.
  // A click before the page is interactive is lost, so it's repeated until the menu opens.
  const sort = page.getByRole("main").locator('[aria-haspopup="menu"]').last();
  const sorts = page.getByRole("menu").getByRole("menuitemradio");
  await expect(async () => {
    await sort.click();
    await expect(page.getByRole("menu")).toBeVisible({ timeout: 2000 });
  }).toPass();
  await expect(sorts.first()).toHaveAttribute("aria-checked", "true");
  await sorts.nth(1).click();
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(page).toHaveURL(/sort=grade/);

  // A candidate's name is read-only for them: no pencil to edit it, only a tooltip on when it
  // gets filled in.
  await page.getByRole("main").locator('a[href*="/candidates/"]').first().click();
  await expect(page).toHaveURL(/\/candidates\/[^/?]+$/, { timeout: 90_000 });
  const noName = page.getByRole("main").getByTestId("no-name").first();
  await expect(noName).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit name" })).toHaveCount(0);
  await noName.hover();
  await expect(noName).toHaveAttribute("data-popup-open");
  await shot(page, "viewer-candidate-name");

  // Their own row in the team: a role badge, nothing to change.
  await visit(page, `/companies/${company.id}/members`);
  await expect(page.getByRole("main").getByRole("listitem").first()).toBeVisible();
  await expect(page.getByTestId("add-member")).toHaveCount(0);
  // No role menu on the team's rows (the page menu's "more pages" is navigation, not a change).
  await expect(
    page.getByRole("main").getByRole("listitem").locator('[aria-haspopup="menu"]'),
  ).toHaveCount(0);
  await shot(page, "viewer-team");
});
