import { expect, test } from "@playwright/test";

import { REQUEST_URL } from "./helpers/env";
import { loaded } from "./helpers/waits";

// The home page's candidates section plays a question as a candidate sees it. Its "question 3 of
// 10" reads in the page's direction: on right-to-left pages the question's number is right of the
// total, never mirrored. Hebrew writes Western digits and Arabic its own, which bidi orders
// differently (Persian's digits order as Western ones do).

for (const locale of ["he", "ar"]) {
  test(`the demo question's counter reads question, then total, in ${locale}`, async ({
    page,
  }) => {
    // Still, on the last screen's question.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}`);
    await loaded(page);
    const count = page.locator("#candidates").getByTestId("question-count").filter({ visible: true });
    await count.scrollIntoViewIfNeeded();
    await expect(count).toBeVisible();

    // Where each number starts on screen.
    const [question, total] = await count.evaluate((element) => {
      const node = element.firstChild!;

      return [...node.textContent!.matchAll(/[\d٠-٩]+/g)].map((number) => {
        const range = document.createRange();
        range.setStart(node, number.index);
        range.setEnd(node, number.index + number[0].length);

        return range.getBoundingClientRect().left;
      });
    });
    expect(question).toBeGreaterThan(total);
  });
}

// The switch above the picture jumps the demo to the mode a visitor picks, back and forth, and
// shows which is on; the frame keeps its size and place as the screens change.
test("the mode switch jumps the demo to either mode, and the frame never moves", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await loaded(page);
  const section = page.locator("#candidates");
  await section.scrollIntoViewIfNeeded();
  const demo = section.getByTestId("candidates-demo");
  const frame = demo.getByTestId("demo-panel");
  const box = () =>
    frame.evaluate((element) => {
      const rect = element.getBoundingClientRect();

      return [rect.width, rect.height, rect.left, rect.top + window.scrollY].map(Math.round).join();
    });
  const [click, voice] = [demo.getByRole("button").nth(0), demo.getByRole("button").nth(1)];
  // Playing once in view: its steps move on.
  const first = await demo.getAttribute("data-step");
  await expect(demo).not.toHaveAttribute("data-step", first!);
  const before = await box();

  await voice.click();
  await expect(voice).toHaveAttribute("aria-pressed", "true");
  await expect(click).toHaveAttribute("aria-pressed", "false");
  // Voice steps are named v…, click ones c… or by their question.
  await expect(demo).toHaveAttribute("data-step", /^v/);
  expect(await box()).toBe(before);

  await click.click();
  await expect(click).toHaveAttribute("aria-pressed", "true");
  await expect(demo).toHaveAttribute("data-step", /^(?!v)/);
  expect(await box()).toBe(before);
});

test("on a phone the modes show as cards in place of the demo", { tag: "@phone-only" }, async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const section = page.locator("#candidates");
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByTestId("candidates-demo")).toBeHidden();
  await expect(section.getByTestId("phone-steps").getByTestId("icon-card")).toHaveCount(2);
  await expect(section.getByTestId("notes")).toBeVisible();
});

// Voice mode speaks every language: under the demo, a line links the guide to its quality in
// each (which opens with its table), and the start's "generate in" picker marks none.
test("the voice quality line links its guide and the picker marks no language", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await loaded(page);

  const guide = page.locator("#candidates").locator('a[href$="/guides/voice-interview-languages"]');
  await expect(guide).toBeVisible();

  await page.locator("main form").first().locator("[aria-labelledby]").click();
  const options = page.getByRole("option");
  await expect(options.first()).toBeVisible();
  await expect(options.locator('svg[class*="lucide-mic"]')).toHaveCount(0);

  await guide.click();
  await expect(page).toHaveURL(/\/guides\/voice-interview-languages$/);
  // One row per language voice mode speaks.
  await expect(page.getByRole("main").getByRole("table").locator("tbody tr")).toHaveCount(23);
});
