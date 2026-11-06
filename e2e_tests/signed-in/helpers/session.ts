import type { Page } from "@playwright/test"

/** How many questions count as answered: one less than the question the session's header says is
 * open ("Question 3 of 10", its `question-count`). */
export async function answered(page: Page): Promise<string> {
  const text = await page.getByTestId("question-count").textContent()

  return String(Number(text?.match(/\d+/)?.[0]) - 1)
}
