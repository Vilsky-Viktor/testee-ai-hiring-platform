import { expect, test, type Page } from "@playwright/test";

import { REQUEST_URL } from "./helpers/env";
import { loaded } from "./helpers/waits";

// The home page's hero: the title and its sentence with two pill buttons under them on the start
// side, the box to start in on the end side (under them on phones); the language and the create
// button on one row in the box; from laptops up, wires from circles into the box; and the facts
// beside the wire running down from it.

// The site's languages, which the facts under the start box count.
const LANGUAGE_COUNT = 23;

/** The hero's title, sentence, two buttons and box, as boxes on the page. */
async function heroBoxes(page: Page) {
  const video = page.getByTestId("video-button");
  await expect(video).toBeVisible();

  return {
    title: (await page.getByRole("heading", { level: 1 }).boundingBox())!,
    text: (await page.getByTestId("hero-text").boundingBox())!,
    help: (await page.getByTestId("page-help").filter({ visible: true }).boundingBox())!,
    video: (await video.boundingBox())!,
    form: (await page.locator("main form").first().boundingBox())!,
  };
}

test("on a wide screen the buttons sit under the sentence, the box beside them", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const { title, text, help, video, form } = await heroBoxes(page);

  expect(text.y).toBeGreaterThanOrEqual(title.y + title.height);
  expect(help.y).toBeGreaterThanOrEqual(text.y + text.height);
  expect(video.y).toBe(help.y);
  expect(video.x).toBeGreaterThanOrEqual(help.x + help.width);
  expect(form.x).toBeGreaterThanOrEqual(video.x + video.width);
});

test("in a right-to-left language the hero mirrors", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/ar");
  const { help, video, form } = await heroBoxes(page);

  expect(video.x + video.width).toBeLessThanOrEqual(help.x);
  expect(form.x + form.width).toBeLessThanOrEqual(video.x);
});

test("on a phone the box comes under the buttons", { tag: "@phone-only" }, async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const { text, help, video, form } = await heroBoxes(page);

  expect(help.y).toBeGreaterThanOrEqual(text.y + text.height);
  expect(video.y).toBe(help.y);
  expect(form.y).toBeGreaterThanOrEqual(video.y + video.height);
});

test("the wires' circles show from laptops up", { tag: "@phone" }, async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await loaded(page);
  const sources = page.getByTestId("hero-source");

  if (info.project.name === "phone") {
    await expect(sources.filter({ visible: true })).toHaveCount(0);

    return;
  }

  await expect(sources).toHaveCount(4);

  // All above the box, the wires' way in.
  const form = (await page.locator("main form").first().boundingBox())!;

  for (const source of await sources.all()) {
    expect((await source.boundingBox())!.y).toBeLessThan(form.y);
  }
});

test("the box's language comes with the page, so the box never grows", async ({ request }) => {
  const html = await (await request.get(`${REQUEST_URL}/`)).text();

  expect(html).toMatch(/<form[^]*aria-labelledby[^]*<\/form>/);
});

test("the box's language and create button share a row", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const form = page.locator("main form").first();
  const language = (await form.locator("[aria-labelledby]").boundingBox())!;
  const submit = (await form.locator('button[type="submit"]').boundingBox())!;

  expect(language.x + language.width).toBeLessThanOrEqual(submit.x);
  expect(language.y + language.height / 2).toBeCloseTo(submit.y + submit.height / 2, 0);
});

// The description sent from the box stays in the tab for the way back from choosing a company,
// never through a reload.
test("a reload starts with an empty box", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await loaded(page);
  await page.evaluate(() =>
    sessionStorage.setItem(
      "testee:draft",
      JSON.stringify({ text: "A backend developer", generateIn: "en" }),
    ),
  );

  await page.reload();
  await loaded(page);
  await expect(page.locator("main textarea").first()).toHaveValue("");
  await expect(page.locator("main form").first().locator('button[type="submit"]')).toBeDisabled();
});

test("the video button's ring holds still with reduced motion", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const video = page.getByTestId("video-button");
  await expect(video).toHaveAccessibleName(/.+/);

  // The ring pulses, and is gone with reduced motion.
  const ring = video.locator(".hero-pill-ring");
  await expect(ring).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(ring).toBeHidden();
});

// The facts under the start box: first the any-job fact, then the languages (as many as testee
// speaks), the time to ready and no subscription; from laptops up, one under another.
test("the facts under the start box start with the any-job fact", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const facts = page.getByTestId("hero-proof").locator("li");
  await expect(facts).toHaveCount(4);
  await expect(facts.nth(0)).not.toBeEmpty();
  await expect(facts.nth(1)).toContainText(String(LANGUAGE_COUNT));

  const boxes = await facts.evaluateAll((all) =>
    all.map((fact) => fact.getBoundingClientRect()).map(({ left, top }) => ({ left, top })),
  );

  for (const [index, box] of boxes.entries()) {
    expect(box.left).toBe(boxes[0].left);

    if (index > 0) {
      expect(box.top).toBeGreaterThan(boxes[index - 1].top);
    }
  }
});
