import { expect, type Locator } from "@playwright/test"

/** Types `text` into a list's search (no button: it searches once typing pauses) until the
 * address carries it. Typed before the page has hydrated, the text would be lost, so it's
 * emptied and typed again until the search goes out. */
export async function searchFor(field: Locator, text: string) {
  const page = field.page()

  await expect(async () => {
    await field.fill("")
    await field.fill(text)
    await expect(page).toHaveURL((url) => url.searchParams.get("q") === text, { timeout: 3_000 })
  }).toPass({ timeout: 30_000 })
}
