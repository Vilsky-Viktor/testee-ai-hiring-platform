import { expect, test } from "@playwright/test";

import { pauseClock } from "./helpers/clock";
import { loaded } from "./helpers/waits";

// The home page's "see who's best" section: one frame playing the candidates list, its PDF
// downloaded and emailed, two candidates' pages shared to a chat, a note posted and the Slack
// channel testee posts to. On phones, what it does as cards.

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

test("on a phone what it does shows as three cards in place of the demo", { tag: "@phone-only" }, async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const section = page.locator("#reports");
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByTestId("reports-demo")).toBeHidden();
  await expect(section.getByTestId("phone-steps").getByTestId("icon-card")).toHaveCount(3);
  await expect(section.getByTestId("notes")).toBeVisible();
});
