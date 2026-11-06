import { expect, test, type Locator } from "@playwright/test";

import { pauseClock } from "./helpers/clock";
import { loaded } from "./helpers/waits";

// The home page's "create an interview" section: one frame playing the four steps, a numbered
// pill on its top edge naming the one shown; under it, short facts. On phones, the steps as cards.
// The last step is the candidate's inbox, the invitation opened.

/** Where `frame` is on the page, rounded: its size and its place from the page's top. */
function frameBox(frame: Locator) {
  return frame.evaluate((element) => {
    const box = element.getBoundingClientRect();

    return [box.width, box.height, box.left, box.top + window.scrollY].map(Math.round).join();
  });
}

test("with reduced motion the create section rests on the invitation the candidate got", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#how");
  await section.scrollIntoViewIfNeeded();

  // The pill names the last step, and the email shows, to the invited address (DEMO_INVITE_EMAIL
  // in frontend/src/config/create-demo.ts; the demo is hidden from screen readers, so it has no
  // roles to find it by).
  await expect(section.getByTestId("create-step").last()).toHaveAttribute("data-current", "true");
  const email = section.getByTestId("demo-invite-email");
  await expect(email).toBeVisible();
  await expect(email).toContainText("maria@example.com");
  await expect(section.getByTestId("demo-writing")).toBeHidden();

  // The interview before it, unseen now, has its topic rows each showing how many questions were
  // written for the topic: DEMO_INTERVIEW.topicQuestions, not what one candidate gets.
  // The list's header row aside, drawn only for sighted visitors.
  const rows = section.getByTestId("demo-interview").locator("ul").last().locator("li:not([aria-hidden])");
  await expect(rows).not.toHaveCount(0);

  for (const row of await rows.all()) {
    await expect(row).toContainText("70");
  }
});

// The pill names each step in turn, as the frame shows it, and the frame never changes size or
// place. The clock runs three seconds at a time (each stage lasts far longer), so a busy page
// still gets through the demo in time.
test("the create demo's pill names each step in turn and the frame never moves", async ({
  page,
}) => {
  test.setTimeout(360_000);
  await page.clock.install();
  await page.goto("/");
  await loaded(page);
  // Time stands still from here on, moving only as the test runs it.
  await pauseClock(page);
  const section = page.locator("#how");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByTestId("notes").locator("li")).not.toHaveCount(0);
  const frame = section.getByTestId("demo-panel");
  await expect(frame).toHaveCount(1);
  const pills = section.getByTestId("create-step");
  await expect(pills).toHaveCount(4);
  const current = () =>
    pills.evaluateAll((all) => all.findIndex((pill) => pill.dataset.current === "true"));
  const boxes = new Set([await frameBox(frame)]);

  expect(await current()).toBe(0);

  for (const step of [1, 2, 3]) {
    await expect
      .poll(
        async () => {
          await page.clock.runFor(3_000);
          boxes.add(await frameBox(frame));

          return current();
        },
        { timeout: 150_000 },
      )
      .toBe(step);
  }

  expect([...boxes]).toHaveLength(1);
});

// The first two stages, played a tenth of a second at a time: the company is asked on a screen
// of its own (no dialog over the box), a topic's name and one of its subtopics are typed into in
// place, and each thing clicked bumps (`data-clicked`) as the click lands. The frame never
// magnifies: the screen shown is never wider than it. The typed words are the demo's English
// texts (`landing.demoContent.create` in frontend/messages/en.json: the third topic's name and
// its second subtopic, each with the words typed at their end).
test("the create demo asks the company on its own screen, edits a topic in place and bumps what it clicks", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.clock.install();
  await page.goto("/");
  await loaded(page);
  await pauseClock(page);
  const section = page.locator("#how");
  const frame = section.getByTestId("demo-panel");
  const shown = frame.locator("[data-shown=true]");
  // Every element bumped, by the pointer's name for it, as the attribute lands.
  await frame.evaluate((element) => {
    const clicked: string[] = [];
    (window as unknown as { clicked: string[] }).clicked = clicked;
    new MutationObserver((changes) => {
      // Added, not removed: a removal's old value is "".
      for (const change of changes) {
        if (change.oldValue === null) {
          clicked.push((change.target as HTMLElement).dataset.demoTarget ?? "");
        }
      }
    }).observe(element, {
      attributes: true,
      attributeFilter: ["data-clicked"],
      attributeOldValue: true,
      subtree: true,
    });
  });
  await section.scrollIntoViewIfNeeded();
  // Before it plays the frame rests on the last screen, so the first comes in from a little
  // larger, cut off at the frame's edge, as a screen left behind does.
  await expect
    .poll(async () => {
      await page.clock.runFor(100);

      return shown.evaluate((element) => getComputedStyle(element).scale);
    })
    .toBe("none");
  // From there the screen shown is never wider than the frame: nothing magnifies it. (Its height
  // may grow past the frame for a moment as it rises into place; its width never does.)
  const widths = new Set<boolean>();
  // Plays the demo a tenth of a second at a time, so each step renders (a click among them),
  // until `done`, for at most a minute of the demo's time.
  const play = async (done: () => Promise<boolean>) => {
    for (let tenths = 0; tenths < 600 && !(await done()); tenths++) {
      await page.clock.runFor(100);
      widths.add(
        await frame.evaluate(
          (element) =>
            element.querySelector("[data-shown=true]")!.getBoundingClientRect().width <=
            element.getBoundingClientRect().width,
        ),
      );
    }

    expect(await done()).toBe(true);
  };

  // The company's screen, in the first stage's place, with no dialog anywhere.
  await play(() => shown.locator('[data-demo-target="continue"]').isVisible());
  await expect(section.getByTestId("create-step").first()).toHaveAttribute("data-current", "true");
  await expect(section.locator('[role="dialog"]')).toHaveCount(0);

  // The topic's name and its subtopic as typed in place, in the list the pointer works on (an
  // unseen copy under it keeps the list's room, with every text in full).
  const typed = () =>
    frame.evaluate((element) =>
      [...element.querySelectorAll("[data-shown=true] [data-demo-target=edit], [data-shown=true] [data-demo-target=subtopic]")]
        .map((part) => part.textContent)
        .join("|"),
    );
  await play(async () => (await typed()) === "Python for ML systems at scale|Type hints and testing");
  await expect(section.locator('[role="dialog"]')).toHaveCount(0);
  expect([...widths]).toEqual([true]);

  const clicked = await page.evaluate(() => (window as unknown as { clicked: string[] }).clicked);
  expect(clicked).toEqual(
    expect.arrayContaining(["paste", "send", "name", "continue", "edit", "subtopic"]),
  );
});

test("on a phone the steps show as four cards in place of the frame", { tag: "@phone-only" }, async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const section = page.locator("#how");
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByTestId("demo-panel")).toBeHidden();
  await expect(section.getByTestId("phone-steps").getByTestId("icon-card")).toHaveCount(4);
  // Each as wide as the screen.
  const widths = await section
    .getByTestId("icon-card")
    .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().width)));
  expect(new Set(widths)).toEqual(new Set([page.viewportSize()!.width]));
});

test("on a 375 px phone the notes are one a row, and nothing scrolls sideways", { tag: "@phone-only" }, async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const section = page.locator("#how");
  await section.scrollIntoViewIfNeeded();

  const notes = section.getByTestId("notes").locator("li").filter({ visible: true });
  const count = await notes.count();
  expect(count).toBeGreaterThan(1);
  const tops = await notes.evaluateAll((items) =>
    items.map((item) => Math.round(item.getBoundingClientRect().top)),
  );
  // Each note on a row of its own, one under another.
  expect(new Set(tops).size).toBe(count);
  expect(tops).toEqual([...tops].sort((a, b) => a - b));

  const widths = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
});

// "create an interview" under the reports, beside the prices and on the closing screen: each
// goes back up to the job description box, ready to type.
for (const id of ["reports", "pricing", "help"]) {
  test(`create an interview in #${id} goes to the job description box`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/");
    await loaded(page);
    const button = page.locator(`#${id}`).getByTestId("start-button");
    await expect(button).toHaveCount(1);
    await button.scrollIntoViewIfNeeded();
    await button.click();

    const box = page.locator("main textarea").first();
    await expect(box).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(box).toBeInViewport();
  });
}
