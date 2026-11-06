import { expect, test } from "@playwright/test";

const DEMOS = "https://www.youtube.com/@testee";

// The home page's closing screen links to testee's demo videos on YouTube, in a new tab.
test("the home page links to the demo videos", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const demos = page.locator(`main a[href="${DEMOS}"]`);
  await expect(demos).toHaveCount(1);
  await expect(demos).toHaveAttribute("target", "_blank");
  await expect(demos).toHaveAttribute("rel", /noopener/);
});
