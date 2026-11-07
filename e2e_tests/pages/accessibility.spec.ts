import { expect, test } from "@playwright/test";

import { violations } from "./helpers/axe";
import { setScheme } from "./helpers/theme";
import { loaded } from "./helpers/waits";

// The signed-out pages checked with axe against WCAG 2.2 AA, light and dark, in a left-to-right
// and a right-to-left language, and the dialogs they open. Motion is reduced so no animation is
// caught halfway.
const PAGES = [
  "/",
  "/features",
  "/hiring-flow",
  "/pricing",
  "/faq",
  "/contact",
  "/practice",
  "/tests",
  "/guides/hiring-engineers",
  "/accessibility",
  "/trust",
  "/api-docs?tab=mcp",
  "/ar",
  "/he/pricing",
];
// Also checked on a phone, where the layout differs most.
const PHONE_PAGES = ["/", "/pricing"];
const THEMES = ["light", "dark"] as const;
// The home pages: axe takes long over their demos' many screens, past the usual time when tests
// run side by side.
const HOME_PAGES = ["/", "/ar"];

for (const path of PAGES) {
  for (const theme of THEMES) {
    const tag = PHONE_PAGES.includes(path) ? "@phone" : [];

    test(`${path} in ${theme} meets WCAG 2.2 AA`, { tag }, async ({ page }) => {
      test.slow(HOME_PAGES.includes(path));
      await setScheme(page, theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await loaded(page);

      expect(await violations(page)).toEqual([]);
    });
  }
}

// States beyond a page's first look: the sign-in dialog and Mira's panel open, light and dark.
for (const theme of THEMES) {
  test(`the sign-in dialog and the assistant's panel in ${theme} meet WCAG 2.2 AA`, async ({
    page,
  }) => {
    // Two scans of the home page (HOME_PAGES).
    test.slow();
    await setScheme(page, theme);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await loaded(page);

    for (const opener of [
      page.getByRole("banner").getByTestId("header-sign-in"),
      page.getByRole("banner").locator("[data-assistant-toggle]"),
    ]) {
      await opener.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await violations(page)).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });
}
