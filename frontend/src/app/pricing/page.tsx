import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"

import { HeroBack } from "@/components/common/hero-back"
import { JsonLd } from "@/components/common/json-ld"
import { PriceCard } from "@/features/pricing/components/price-cards"
import { Button } from "@/components/ui/button"
import { InfoCard } from "@/components/common/warning-card"
import { formatPrice } from "@/lib/format"
import { pageMetadata, siteUrl } from "@/lib/site"
import { softwareData } from "@/lib/structured-data"
import { visitorCatalog } from "@/lib/catalog"
import { PageKey } from "@/components/common/page-key"

export async function generateMetadata() {
  const t = await getTranslations("pricing")

  return pageMetadata(t("title"), t("description"), "/pricing", true)
}

export default async function PricingPage() {
  const t = await getTranslations("pricing")
  const billing = await getTranslations("billing")
  const landing = await getTranslations("landing")
  const locale = await getLocale()
  // Billing not answering (starting up, or failing): the page says so instead of its prices,
  // rather than showing nothing or the error page.
  const catalog = await visitorCatalog()
  const header = (
    <div>
      {/* From the main's padding, up to the page's top. */}
      <HeroBack className="-top-16" />
      <div className="space-y-6 text-center">
        <h1 className="no-dot font-heading text-5xl font-medium tracking-tight text-balance sm:text-6xl">
          {landing("freeToStart.title")
            .split("\n")
            .map((line) => (
              <span key={line} className="block lowercase">
                {line}
                <span className="blue-dot">.</span>
              </span>
            ))}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-balance text-muted-foreground">
          {landing("freeToStart.text")}
        </p>
        <Button
          className="h-12 px-6 text-base"
          render={<Link href="/top-up" />}
          nativeButton={false}
        >
          {t("topUp")}
        </Button>
      </div>
    </div>
  )

  if (!catalog) {
    return (
      <main className="mx-auto max-w-page space-y-16 px-6 py-12">
        <PageKey page="pricing" />
        {header}
        <InfoCard>{t("unavailable")}</InfoCard>
      </main>
    )
  }

  const [standard] = catalog.candidate_prices
  const price = (cents: number) => formatPrice(cents, catalog.currency, locale)
  const lowest = Math.min(...catalog.candidate_prices.map((tier) => tier.cents))

  return (
    <main className="mx-auto max-w-page space-y-20 px-6 py-16">
      <PageKey page="pricing" />
      <JsonLd data={softwareData(siteUrl(), t("intro"), catalog)} />
      {header}

      {/* What costs nothing and what does, in the order you meet them. */}
      <ul className="grid gap-4 md:grid-cols-3">
        <PriceCard price={t("free")} what={t("test")} highlighted />
        <PriceCard
          price={t("free")}
          what={t("welcome", { count: catalog.free_candidates })}
          highlighted
        />
        <PriceCard
          price={t("fromPrice", { price: price(lowest) })}
          what={t("candidate")}
        />
      </ul>

      {/* A candidate gets cheaper with larger top-ups (billing decides). */}
      <section className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="font-heading text-3xl font-medium tracking-tight">
            {t("volumeTitle")}
          </h2>
          <p className="text-base text-muted-foreground">{t("volumeText")}</p>
        </div>
        <ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-(--tiers)"
          style={
            {
              "--tiers": `repeat(${catalog.candidate_prices.length}, minmax(0, 1fr))`,
            } as React.CSSProperties
          }
        >
          {catalog.candidate_prices.map((tier) => (
            <PriceCard
              key={tier.from_cents}
              price={price(tier.cents)}
              what={
                tier === standard
                  ? t("anyTopUp")
                  : t("candidateVolume", { from: price(tier.from_cents) })
              }
              highlighted={tier.cents === lowest}
              tag={
                tier.cents === lowest
                  ? landing("freeToStart.bestPrice")
                  : undefined
              }
            />
          ))}
        </ul>
        {/* The credits, the taxes and refunds, each on its own line, in one card. */}
        <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
          <span className="block">
            {t("credits", { credits: catalog.candidate_credits })}
          </span>
          <span className="mt-1 block">{billing("taxes")}</span>
          <span className="mt-1 block">
            {landing("freeToStart.cards.refund.text")}
          </span>
        </InfoCard>
      </section>

      <section className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-medium tracking-tight">
            {t("referrals")}
          </h2>
          <p className="text-base text-muted-foreground">
            {t("referralsNote")}
          </p>
        </div>
        <ul className="mx-auto max-w-xl">
          <PriceCard
            price={t("each", { count: catalog.referral_company })}
            what={t("companyReferral")}
          />
        </ul>
      </section>
    </main>
  )
}
