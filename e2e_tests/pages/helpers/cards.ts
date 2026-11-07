import { expect, type Locator } from "@playwright/test";

/** A section's four cards stand side by side in columns, each at the same height. */
export async function expectFourColumns(section: Locator) {
  const cards = section.getByTestId("trust-cards").locator("li");
  await expect(cards).toHaveCount(4);
  const boxes = await cards.evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();

      return { left: Math.round(box.left), top: Math.round(box.top) };
    }),
  );

  expect(new Set(boxes.map((box) => box.top)).size).toBe(1);
  expect(new Set(boxes.map((box) => box.left)).size).toBe(4);
}
