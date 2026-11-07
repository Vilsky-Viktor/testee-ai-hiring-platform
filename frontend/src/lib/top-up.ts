import type { Catalog } from "@/types/billing"

type Custom = Catalog["custom"]

/** What billing sells for a chosen number of candidates, as its catalog says: the count at
 * its tier's price, or the next tier's smallest top-up from the count billing gives for it;
 * on sale once billing's Paddle product for it is set. */
export function customTopUp(custom: Custom, candidates: number) {
  const index = custom.tiers.findLastIndex(
    (tier) => candidates >= tier.from_candidates
  )
  const tier = custom.tiers[index]
  const upgrade = tier.upgrade_from !== null && candidates >= tier.upgrade_from
  const bought = upgrade ? custom.tiers[index + 1] : tier
  const count = upgrade ? bought.from_candidates : candidates

  return {
    candidates: count,
    cents: count * bought.cents,
    onSale: custom.on_sale,
    upgraded: upgrade,
  }
}
