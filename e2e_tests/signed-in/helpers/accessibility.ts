import { expect, type Page } from "@playwright/test"

import { violations } from "./axe"

/** The page as it is now (an open dialog included) checked with axe against WCAG 2.2 AA; `name`
 * says which screen, for the failure's message. */
export async function expectAccessible(page: Page, name: string) {
  expect(await violations(page), name).toEqual([])
}
