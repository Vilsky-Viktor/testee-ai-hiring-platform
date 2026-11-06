import { describe, expect, it } from "vitest"

import { customTopUp } from "@/lib/top-up"
import type { Catalog } from "@/types/billing"

// Billing's catalog: four levels, the next one bought instead from `upgrade_from`.
const custom: Catalog["custom"] = {
  min_candidates: 10,
  max_candidates: 1000,
  on_sale: true,
  tiers: [
    { from_candidates: 10, cents: 500, upgrade_from: 40 },
    { from_candidates: 50, cents: 400, upgrade_from: 150 },
    { from_candidates: 200, cents: 300, upgrade_from: 334 },
    { from_candidates: 500, cents: 200, upgrade_from: null },
  ],
}

describe("what a count buys", () => {
  it.each([
    [39, 39, 19_500, false],
    [40, 50, 20_000, true],
    [149, 149, 59_600, false],
    [150, 200, 60_000, true],
    [333, 333, 99_900, false],
    [334, 500, 100_000, true],
    [1000, 1000, 200_000, false],
  ])(
    "%i candidates buy %i for %i cents",
    (chosen, candidates, cents, upgraded) => {
      expect(customTopUp(custom, chosen)).toMatchObject({
        candidates,
        cents,
        upgraded,
      })
    }
  )

  it("is on sale once billing's catalog says so", () => {
    expect(customTopUp(custom, 160).onSale).toBe(true)
    expect(customTopUp({ ...custom, on_sale: false }, 160).onSale).toBe(false)
  })
})
