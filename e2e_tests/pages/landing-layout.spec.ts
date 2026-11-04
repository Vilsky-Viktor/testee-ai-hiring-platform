import { expect, test } from "@playwright/test";

import { loaded } from "./helpers/waits";

// The home page's layout: its sections in the order of a company's hiring, each fitting the
// window on a desktop and on a phone, in every language, and its pictures holding still with
// reduced motion.

const SECTIONS = [
  "how",
  "invite",
  "candidates",
  "reports",
  "agent",
  "trust",
  "compare",
  "pricing",
  "help",
];

test("every section shows, in order, within the window", { tag: "@phone" }, async ({ page }) => {
  // The local dev server compiles the home page on first open.
  test.setTimeout(120_000);
  await page.goto("/");
  const ids = await page
    .locator("main > section")
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(ids).toEqual(SECTIONS);
  const width = page.viewportSize()!.width;

  for (const id of SECTIONS) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading").first()).not.toBeEmpty();
    // Its cards' entrance (coming in from past the edges) ended: they rest in place.
    await section.evaluate((element) =>
      Promise.all(
        element
          .getAnimations({ subtree: true })
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
    );
    // Nothing in it reaches past the window's edges: the page never scrolls sideways. A part cut
    // off by a box inside the window (a demo's camera zoomed in) shows nothing past it.
    const outside = await section.evaluate((element, right) => {
      const beyond = (box: DOMRect) => box.left < -1 || box.right > right + 1;
      const clipped = (part: Element) => {
        for (let box = part.parentElement; box; box = box === element ? null : box.parentElement) {
          if (
            /hidden|clip/.test(getComputedStyle(box).overflowX) &&
            !beyond(box.getBoundingClientRect())
          ) {
            return true;
          }
        }

        return false;
      };

      return [...element.querySelectorAll("*")]
        .filter((part) => {
          const box = part.getBoundingClientRect();

          return box.width > 0 && beyond(box) && !clipped(part);
        })
        .map((part) => part.outerHTML.slice(0, 120));
    }, width);
    expect(outside, id).toEqual([]);
  }

  const widths = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
});

// In every language the texts fit the window: no word or line runs past its edges (the hero's
// wires, drawn out to the window's edges, aside). On a phone, the narrowest screen, where a text
// runs out first; the example's code too, which keeps its own size in Japanese, Chinese and
// Korean and scrolls inside its block.
const LOCALES = [
  "ru", "uk", "es", "pt", "de", "fr", "it", "pl", "nl", "tr", "ar", "he", "fa", "ja", "zh", "ko",
  "hi", "id", "th", "vi", "fil", "et",
];

for (const locale of LOCALES) {
  test(`the home page fits the window in ${locale}`, { tag: "@phone-only" }, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/${locale}`);
    const outside = await page.locator("main").evaluate((element, right) => {
      return [...element.querySelectorAll("*")]
        .filter((part) => {
          const box = part.getBoundingClientRect();

          return (
            box.width > 0 &&
            (box.left < -1 || box.right > right + 1) &&
            !part.closest("svg")
          );
        })
        .map((part) => part.outerHTML.slice(0, 120));
    }, page.viewportSize()!.width);
    expect(outside).toEqual([]);
  });
}

test("with reduced motion every picture is a still frame", async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  // The page's timers run on Playwright's clock, so a second and a half passes at once.
  await page.clock.install();
  await page.goto("/");
  await loaded(page);
  // The invite picture's wires are drawn once its cards are laid out, after the page loads.
  await expect(page.locator("#invite svg > g > path").first()).toBeAttached();

  for (const id of SECTIONS) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    const before = await section.innerHTML();
    await page.clock.runFor(1_500);
    // Nothing changes, and nothing in sight moves.
    expect(await section.innerHTML(), id).toBe(before);
    const moving = await section.evaluate(
      (element) =>
        element
          .getAnimations({ subtree: true })
          .filter(
            (animation) =>
              animation instanceof CSSAnimation &&
              animation.playState === "running" &&
              ((animation.effect as KeyframeEffect).target as Element).checkVisibility(),
          ).length,
    );
    expect(moving, id).toBe(0);
  }
});
