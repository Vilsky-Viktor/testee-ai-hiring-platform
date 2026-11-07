import { expect, test } from "@playwright/test";

import { pauseClock } from "./helpers/clock";
import { loaded } from "./helpers/waits";

// The home page's "see who's best" section: one frame playing the candidates list, its PDF
// downloaded and emailed, two candidates' pages shared to a chat, a note posted and the Slack
// channel testee posts to. On phones, what it does as cards. Under it, four columns on what the
// reports tell about how a candidate answered, then the line of facts.

// Steps the demo reaches, in order (frontend/src/config/reports-demo-steps.ts): the PDF
// downloaded, then emailed; each candidate's summary in the chat; the note posted; Slack last.
const STEPS = ["downloaded", "sent", "summary0", "summary1", "posted", "slackScrolled"];

test("the reports demo reaches sharing, the notes and Slack, and the frame never moves", async ({
  page,
}) => {
  test.setTimeout(360_000);
  await page.clock.install();
  await page.goto("/");
  await loaded(page);
  // Time stands still from here on, moving only as the test runs it.
  await pauseClock(page);
  const section = page.locator("#reports");
  const demo = section.getByTestId("reports-demo");
  // Every step as it lands, in the page, with where the frame is then: a step can be over by the
  // time the test could read it. The clock is stopped, so none has gone by; the step the demo
  // rests on before it plays isn't one it reached, so only changes count.
  const played = await demo.evaluateHandle((element) => {
    const frame = element.querySelector('[data-testid="demo-panel"]')!;
    const box = () => {
      const rect = frame.getBoundingClientRect();

      return [rect.width, rect.height, rect.left, rect.top + window.scrollY].map(Math.round).join();
    };
    const log = { steps: new Set<string>(), boxes: new Set([box()]) };
    new MutationObserver(() => {
      log.steps.add((element as HTMLElement).dataset.step!);
      log.boxes.add(box());
    }).observe(element, { attributes: true, attributeFilter: ["data-step"] });

    return log;
  });
  await section.scrollIntoViewIfNeeded();

  // The page is heavy: a whole run of the demo takes minutes on a busy machine, so the test adds
  // no time of its own between the clock's runs.
  await expect
    .poll(
      async () => {
        await page.clock.runFor(5_000);

        return played.evaluate(({ steps }, wanted) => wanted.filter((step) => steps.has(step)), STEPS);
      },
      { timeout: 300_000, intervals: [0] },
    )
    .toEqual(STEPS);

  expect(await played.evaluate(({ boxes }) => [...boxes])).toHaveLength(1);
});

test("four columns show side by side under the demo, above the line of facts", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await loaded(page);
  const section = page.locator("#reports");
  const list = section.getByTestId("trust-cards");
  const columns = list.getByRole("listitem");
  await expect(columns).toHaveCount(4);
  await list.scrollIntoViewIfNeeded();

  const tops: number[] = [];

  for (const column of await columns.all()) {
    await expect(column).toHaveCSS("opacity", "1");
    await expect(column.getByRole("heading")).not.toBeEmpty();
    await expect(column.getByRole("paragraph")).not.toBeEmpty();
    tops.push((await column.boundingBox())!.y);
  }

  for (const top of tops) {
    expect(top).toBeCloseTo(tops[0], 0);
  }

  const demo = (await section.getByTestId("reports-demo").boundingBox())!;
  const box = (await list.boundingBox())!;
  const notes = (await section.getByTestId("notes").boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(demo.y + demo.height);
  expect(notes.y).toBeGreaterThanOrEqual(box.y + box.height);
});

test("on a phone what it does shows as three cards in place of the demo", { tag: "@phone-only" }, async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const section = page.locator("#reports");
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByTestId("reports-demo")).toBeHidden();
  await expect(section.getByTestId("phone-steps").getByTestId("icon-card")).toHaveCount(3);
  await expect(section.getByTestId("trust-cards").getByRole("listitem")).toHaveCount(4);
  await expect(section.getByTestId("notes")).toBeVisible();
});
