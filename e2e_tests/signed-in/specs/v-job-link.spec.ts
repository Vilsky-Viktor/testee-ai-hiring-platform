import { expect, test } from "../fixtures";
import { api, createCompany, createInterview } from "../helpers/api";
import { inviteToken, joinedEmails } from "../helpers/db";
import { visit } from "../helpers/navigation";
import { redis } from "../helpers/redis";
import { shot } from "../helpers/screenshots";
import { ownerEmail, throwawayEmail } from "../helpers/users";

// Someone starts from a test's shareable link (a job ad) and is sent their own link by email.
// Their own link still works after the company turns the shareable link off.
test("a candidate starts from the job link and continues from their own link", async ({
  signInAs,
}) => {
  const owner = await signInAs(ownerEmail());
  const company = await createCompany(owner);
  const interviewId = await createInterview(owner, company.id);
  const { link_token: token } = await api<{ link_token: string }>(
    owner,
    "PUT",
    `/companies/interviews/${interviewId}/link`,
    { on: true },
  );

  const email = throwawayEmail("link-candidate");
  const candidate = await signInAs(email);
  // The page's only button starts the test.
  const start = candidate.getByRole("main").getByRole("button");
  await visit(candidate, `/apply/${token}`);
  await expect(start).toBeVisible();
  await shot(candidate, "job-link");
  await candidate.getByTestId("start-pledge").filter({ visible: true }).click();
  await start.click();
  await expect(candidate).toHaveURL(/\/sessions\//);
  await expect.poll(() => joinedEmails(email)).toBe(1);

  // The company takes the link down; the emailed link still continues the interview.
  await api(owner, "PUT", `/companies/interviews/${interviewId}/link`, {
    on: false,
  });
  await visit(candidate, `/invite/${await inviteToken(email)}`);
  // Continuing: pledged already, so no box to tick.
  await expect(candidate.getByTestId("start-pledge")).toHaveCount(0);
  await start.click();
  await expect(candidate).toHaveURL(/\/sessions\//);
  // Starting again sends no second email.
  expect(await joinedEmails(email)).toBe(1);
});

// A link over its hourly limit: the candidate gets the busy page with the way back, and everyone
// in the company hears of it once, with the interview's link.
test("a link at its hourly limit shows the busy page and tells the company", async ({ signInAs }) => {
  const owner = await signInAs(ownerEmail());
  const company = await createCompany(owner);
  const interviewId = await createInterview(owner, company.id);
  const { link_token: token } = await api<{ link_token: string }>(
    owner,
    "PUT",
    `/companies/interviews/${interviewId}/link`,
    { on: true },
  );
  const counter = `rate:link-starts:${interviewId}`;
  await redis("SET", counter, "100000", "EX", "3600");

  const candidate = await signInAs(throwawayEmail("link-busy"));
  const start = candidate.getByRole("main").getByRole("button");
  await visit(candidate, `/apply/${token}`);
  await candidate.getByTestId("start-pledge").filter({ visible: true }).click();
  await start.click();
  const busy = candidate.getByTestId("link-busy");
  await expect(busy).toBeVisible();
  await shot(candidate, "link-busy");
  expect(new URL(candidate.url()).pathname).toBe(`/apply/${token}`);

  const notices = async () => {
    const { items } = await api<{ items: { kind: string; link: string }[] }>(
      owner,
      "GET",
      "/notifications/me?fresh=true",
    );

    return items.filter((item) => item.kind === "link_refused").map((item) => item.link);
  };
  await expect.poll(notices).toEqual([`/companies/${company.id}/interviews/${interviewId}`]);

  // Trying again goes on from the start once the link takes people again.
  await busy.getByRole("button").click();
  await expect(busy).toHaveCount(0);
  await redis("DEL", counter);
  await candidate.getByTestId("start-pledge").filter({ visible: true }).click();
  await start.click();
  await expect(candidate).toHaveURL(/\/sessions\//);
});
