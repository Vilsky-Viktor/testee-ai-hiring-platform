import { expect, test } from "@playwright/test";

import { loaded, scrollAtRest } from "./helpers/waits";

// The home page's "create an interview" buttons scroll smoothly back up to the box, not in one
// jump; and so does every link within the page.

test("create an interview scrolls smoothly up to the box", async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto("/")
  await loaded(page)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("smooth")
  const button = page.locator("#reports").getByTestId("start-button")
  await button.scrollIntoViewIfNeeded()
  await scrollAtRest(page)
  const start = await page.evaluate(() => window.scrollY)
  expect(start).toBeGreaterThan(0)
  // Every place the page scrolls through on its way.
  await page.evaluate(() => {
    const passed: number[] = []
    Object.assign(window, { passed })
    window.addEventListener("scroll", () => passed.push(window.scrollY))
  })
  await button.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  const passed = await page.evaluate(() => (window as unknown as { passed: number[] }).passed)
  // A jump lands at once; a smooth scroll passes places between the section and the top.
  expect(passed.some((place) => place > 0 && place < start)).toBe(true)
})

// On a long page, "back to top" shows once it's scrolled down, and goes back to the top.
test("back to top shows on a long page and returns to its top", async ({ page }) => {
  await page.goto("/")
  await loaded(page)
  const button = page.getByTestId("back-to-top")
  await expect(button).toHaveCount(0)
  await page.mouse.wheel(0, 2500)
  await expect(button).toBeVisible()
  // An icon alone: its label is what screen readers read.
  await expect(button).toHaveAccessibleName(/.+/)
  await button.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await expect(button).toHaveCount(0)
})
