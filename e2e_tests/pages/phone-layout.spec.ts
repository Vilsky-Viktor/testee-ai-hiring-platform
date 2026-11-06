import { expect, test } from "./helpers/templates";
import { loaded, settled } from "./helpers/waits";

// How the public pages fit a phone: wider previews, a footer menu in two columns, popups
// across the screen, no keyboard hint on a touch screen. Desktop keeps its layout.

const isPhone = (name: string) => name === "phone";
// The page's side padding (px-6, CLAUDE.md's rule 6).
const GUTTER = 24;

// The home page's title: its two lines close together, as on desktop.
test("the home page's title lines sit close together", { tag: "@phone" }, async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const title = page.locator("h1");
  const [lineHeight, fontSize] = await title.evaluate((element) => {
    const style = getComputedStyle(element);

    return [parseFloat(style.lineHeight), parseFloat(style.fontSize)];
  });
  expect(lineHeight).toBe(fontSize);
});

// On desktop the footer's menu stands in three columns; on phones in two, so the footer stays short.
test("the footer's menu is two columns on phones", { tag: "@phone" }, async ({ page }, info) => {
  await page.goto("/faq");
  const footer = page.getByRole("contentinfo");
  const links = footer.getByRole("navigation").first().getByRole("link");
  const lefts = await links.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().left)),
  );
  const columns = new Set(lefts).size;

  if (!isPhone(info.project.name)) {
    expect(columns).toBe(3);

    return;
  }

  expect(columns).toBe(2);
  const icon = footer.locator('[role="img"] svg').first();
  expect((await icon.boundingBox())!.width).toBe(32);
  await expect(page.getByRole("main").locator("[data-assistant-toggle]")).toHaveCSS(
    "height",
    "48px",
  );
});

// On phones a dialog spans the screen's width, with square corners.
test("a dialog spans a phone's width", { tag: "@phone" }, async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await page.getByTestId("page-help").filter({ visible: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // It finishes opening first.
  await settled(dialog);
  const box = (await dialog.boundingBox())!;

  if (isPhone(info.project.name)) {
    expect(Math.round(box.x)).toBe(0);
    expect(Math.round(box.width)).toBe(page.viewportSize()!.width);
    await expect(dialog).toHaveCSS("border-top-left-radius", "0px");
    // The help fills the screen, and Close is in sight without scrolling, and after it.
    expect(Math.round(box.height)).toBe(page.viewportSize()!.height);
    const close = dialog.locator('[data-slot="dialog-footer"] button');
    await expect(close).toBeInViewport();
    await dialog.evaluate((element) => element.scrollBy(0, 2_000));
    await expect(close).toBeInViewport();
  } else {
    expect(box.x).toBeGreaterThan(0);
    await expect(dialog).not.toHaveCSS("border-top-left-radius", "0px");
  }
});

// "⌘/Ctrl + Enter to send" only where there's a keyboard: not on a touch screen.
test("the send shortcut hint shows only without a touch screen", { tag: "@phone" }, async ({
  page,
}, info) => {
  await page.goto("/contact");
  // The hint under the message.
  const hint = page.locator("main form textarea + p");

  if (isPhone(info.project.name)) {
    await expect(hint).toBeHidden();
  } else {
    await expect(hint).toBeVisible();
  }
});

// On phones the home page's box to start in reaches the screen's edges; the pricing page's cards
// fill the room inside the page's gutters.
test("the home page's box spans a phone's width and the prices the page's", { tag: "@phone-only" }, async ({
  page,
}) => {
  test.setTimeout(120_000);
  const width = page.viewportSize()!.width;

  await page.goto("/");
  const start = page.locator("main form").first();
  const startBox = (await start.boundingBox())!;
  expect(Math.round(startBox.x)).toBe(0);
  expect(Math.round(startBox.width)).toBe(width);

  await page.goto("/pricing");
  const prices = (await page.locator("main ul").first().boundingBox())!;
  expect(Math.round(prices.x)).toBe(GUTTER);
  expect(Math.round(prices.width)).toBe(width - 2 * GUTTER);
});

// Opening the home page doesn't put the cursor in its box: on a phone the keyboard would cover
// the page.
test("the home page's box isn't focused on load", { tag: "@phone" }, async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await loaded(page);
  await expect(page.locator("main textarea").first()).not.toBeFocused();
});

// On phones a test's practice page has its start under the title, then its facts.
test("a practice page starts under its title on a phone", { tag: "@phone-only" }, async ({
  page,
  addTemplate,
}) => {
  test.setTimeout(120_000);
  const template = await addTemplate();
  await page.goto(`/practice/${template.slug}`);
  const title = (await page.locator("h1").boundingBox())!;
  const start = (await page.getByTestId("start-practice").boundingBox())!;
  const facts = (await page.getByTestId("practice-facts").boundingBox())!;
  expect(start.y).toBeGreaterThanOrEqual(title.y + title.height);
  expect(facts.y).toBeGreaterThanOrEqual(start.y + start.height);
});

// The header's logo link is named by what it shows ("t." on a phone, the whole logo on a wider
// screen) and then where it leads, so a voice user can say what they see (WCAG 2.5.3).
test("the header's logo link is named by its visible text", { tag: "@phone" }, async ({ page }) => {
  await page.goto("/");
  const logo = page.getByRole("banner").getByRole("link").first();
  // The logo itself, as drawn: letters hidden on a phone aren't in its text.
  const shown = (await logo.locator("span").first().innerText()).replace(/\s/g, "");
  expect(shown.length).toBeGreaterThan(0);
  const letters = [...shown].map((letter) => letter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  await expect(logo).toHaveAccessibleName(new RegExp(`^${letters.join("\\s*")}\\s+\\S`));
});

// On a phone the header's links move into a menu opened by a button left of the logo; it lists
// them in order and closes on Escape, on its close button and when a link is followed.
test("on a phone the header's links are in the menu left of the logo", { tag: "@phone-only" }, async ({
  page,
}) => {
  await page.goto("/faq");
  await loaded(page);
  const banner = page.getByRole("banner");
  await expect(banner.getByRole("navigation")).toHaveCount(0);
  const burger = banner.getByRole("button").first();
  await expect(burger).toHaveAccessibleName(/.+/);
  const [burgerBox, logoBox] = [await burger.boundingBox(), await banner.getByRole("link").first().boundingBox()];
  expect(burgerBox!.x + burgerBox!.width).toBeLessThanOrEqual(logoBox!.x);

  const menu = page.getByRole("dialog");
  await burger.click();
  const links = menu.getByRole("navigation").getByRole("link");
  await expect(links.first()).toBeVisible();
  expect(await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")))).toEqual([
    "/dashboard",
    "/features",
    "/hiring-flow",
    "/pricing",
  ]);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);

  // Its one button closes it.
  await burger.click();
  await expect(menu.getByRole("button")).toHaveCount(1);
  await expect(menu.getByRole("button")).toHaveAccessibleName(/.+/);
  await menu.getByRole("button").click();
  await expect(menu).toHaveCount(0);

  await burger.click();
  await menu.locator('a[href="/hiring-flow"]').click();
  await expect(page).toHaveURL(/\/hiring-flow$/);
  await expect(menu).toHaveCount(0);
});
