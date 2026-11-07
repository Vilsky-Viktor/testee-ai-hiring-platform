"use client"

import { cn } from "cn"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { BuyButton } from "@/components/common/buy-button"
import { FloatingInput } from "@/components/ui/floating-field"
import { onlyDigits } from "@/lib/digits"
import { formatPrice } from "@/lib/format"
import { customTopUp } from "@/lib/top-up"
import type { Catalog } from "@/types/billing"

/** A top-up of any number of candidates: typed, or chosen by where each price starts; what it
 * buys, how far the next price is, and the button that opens the checkout. */
export function CustomTopUp({
  catalog,
  companyId,
}: {
  catalog: Catalog
  companyId: string
}) {
  const t = useTranslations("billing")
  const locale = useLocale()
  const { custom, candidate_credits: perCandidate } = catalog
  const { min_candidates: min, max_candidates: max, tiers } = custom
  const [typed, setTyped] = useState(String(min))
  const count = Number(typed)
  // While a number is being typed it can be out of range: what shows stays in range, and it can't
  // be bought until it's in range.
  const inRange = count >= min && count <= max
  const fitted = Math.min(Math.max(count, min), max)
  const bought = customTopUp(custom, fitted)
  const unit = bought.cents / bought.candidates
  const price = (cents: number) => formatPrice(cents, catalog.currency, locale)

  return (
    <div className="space-y-6">
      <FloatingInput
        label={t("howMany")}
        inputMode="numeric"
        dir="ltr"
        value={typed}
        onChange={(event) => setTyped(onlyDigits(event.target.value))}
        onBlur={() => setTyped(String(fitted))}
        className="h-20 text-center font-heading text-4xl font-medium tabular-nums md:text-4xl"
        data-testid="custom-count"
      />
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-(--tiers)"
        style={
          {
            "--tiers": `repeat(${tiers.length}, minmax(0, 1fr))`,
          } as React.CSSProperties
        }
      >
        {tiers.map((tier) => (
          <button
            key={tier.from_candidates}
            type="button"
            aria-pressed={tier.cents === unit}
            onClick={() => setTyped(String(tier.from_candidates))}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl bg-surface px-3 py-3 transition-colors hover:bg-input",
              tier.cents === unit && "shadow-[inset_0_0_0_1px_var(--primary)]"
            )}
          >
            <span className="font-heading text-xl font-medium tabular-nums">
              {tier.from_candidates.toLocaleString(locale)}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {t.rich("perCandidate", {
                price: price(tier.cents),
                // "/candidate" a step smaller than the price.
                unit: (chunks) => (
                  <span className="text-[0.625rem]">{chunks}</span>
                ),
              })}
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-1 text-center">
        <p className="text-base" data-testid="custom-quote">
          {t("quote", {
            count: bought.candidates,
            price: price(unit),
            credits: bought.candidates * perCandidate,
          })}
        </p>
        {/* Its line is always there, so nothing moves when it changes. */}
        <p className="min-h-5 text-sm text-muted-foreground">
          {bought.upgraded && (
            <span data-testid="custom-upgraded">
              {t("upgraded", { count: bought.candidates })}
            </span>
          )}
        </p>
      </div>
      <BuyButton
        catalog={catalog}
        candidates={bought.candidates}
        onSale={bought.onSale && inRange}
        companyId={companyId}
        label={t("pay", { price: price(bought.cents) })}
        className="h-14 w-full text-lg"
      />
    </div>
  )
}
