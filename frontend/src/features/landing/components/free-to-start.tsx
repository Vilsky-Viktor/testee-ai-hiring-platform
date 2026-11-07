import { getLocale, getTranslations } from "next-intl/server"

import { PriceCard } from "@/features/landing/components/price-card"
import { Receipt } from "@/features/landing/components/receipt"
import { MoreLink } from "@/components/common/more-link"
import { LandingSection } from "@/features/landing/components/section"
import { StartButton } from "@/features/landing/components/start-button"
import {
  TrustCards,
  TrustCardText,
} from "@/features/landing/components/trust-cards"
import {
  DEMO_INVITED,
  FREE_CARDS,
  FREE_LINES,
} from "@/config/free-to-start-demo"
import { BAND } from "@/config/landing-backgrounds"
import { formatPrice } from "@/lib/format"
import type { Catalog } from "@/types/billing"

/** Everything is free, candidates are what's paid for: two cards alike, a receipt for a whole
 * interview where only the candidates who answered cost anything, and beside it the free start
 * and the top-ups, a candidate cheaper the bigger the top-up, the cheapest lit. Prices from
 * billing's catalog. */
export async function FreeToStartSection({ catalog }: { catalog: Catalog }) {
  const t = await getTranslations("landing.freeToStart")
  const landing = await getTranslations("landing")
  const locale = await getLocale()
  const price = (cents: number) => formatPrice(cents, catalog.currency, locale)
  // The receipt pays for the biggest top-up's candidates at its price, the lowest per candidate.
  const topUp = catalog.products.reduce((best, product) =>
    product.candidate_cents < best.candidate_cents ? product : best
  )

  return (
    <LandingSection
      id="pricing"
      title={t("title")}
      text={t("text")}
      background={BAND}
    >
      <div className="flex flex-col items-center gap-10">
        {/* Two cards alike, as tall as each other: the receipt and the prices. */}
        <div className="grid w-full max-w-[68rem] gap-6 md:grid-cols-2">
          <Receipt
            free={
              Object.fromEntries(
                FREE_LINES.map((key) => [
                  key,
                  t(`lines.${key}`, { count: DEMO_INVITED }),
                ])
              ) as Record<(typeof FREE_LINES)[number], string>
            }
            zero={price(0)}
            paid={t("lines.answered", { count: topUp.candidates })}
            paidCents={topUp.price_cents}
            currency={catalog.currency}
            totalLabel={t("total")}
            perCandidate={t("each", { price: price(topUp.candidate_cents) })}
          />
          <PriceCard
            free={t("free", { count: catalog.free_candidates })}
            per={t("perCandidate")}
            best={t("bestPrice")}
            rows={catalog.products.map((product) => ({
              key: product.key,
              price: price(product.candidate_cents),
              pack: t("pack", {
                count: product.candidates,
                price: price(product.price_cents),
              }),
              used: product.key === topUp.key,
            }))}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <StartButton
                label={landing("closing.start")}
                className="h-12 px-4 text-base"
              />
              <MoreLink href="/pricing" className="h-12 px-4">
                {t("see")}
              </MoreLink>
            </div>
          </PriceCard>
        </div>
        {/* A promo: its columns pop in as they come into view (promo.css). */}
        <div data-promo className="w-full">
          <TrustCards
            cards={FREE_CARDS.map((key) => ({
              key,
              content: (
                <TrustCardText
                  title={t(`cards.${key}.title`, {
                    count: catalog.currencies.length,
                  })}
                >
                  {t(`cards.${key}.text`)}
                </TrustCardText>
              ),
            }))}
          />
        </div>
      </div>
    </LandingSection>
  )
}
