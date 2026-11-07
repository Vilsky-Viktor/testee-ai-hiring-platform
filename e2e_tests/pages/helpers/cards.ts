import { expect, type Locator } from "@playwright/test";

/** A section's four cards stand side by side in columns, each at the same height: their places
 * in the layout, as they pop in one after another, each moved by its animation for a moment. */
export async function expectFourColumns(section: Locator) {
  const cards = section.getByTestId("trust-cards").locator("li");
  await expect(cards).toHaveCount(4);
  const boxes = await cards.evaluateAll((items) =>
    (items as HTMLElement[]).map((item) => ({ left: item.offsetLeft, top: item.offsetTop })),
  );

  expect(new Set(boxes.map((box) => box.top)).size).toBe(1);
  expect(new Set(boxes.map((box) => box.left)).size).toBe(4);
}
