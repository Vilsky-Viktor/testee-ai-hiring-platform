import { getLocale, getTranslations } from "next-intl/server"

import { HeroBack } from "@/components/common/hero-back"
import { JsonLd } from "@/components/common/json-ld"
import { MoreLink } from "@/components/common/more-link"
import { PageKey } from "@/components/common/page-key"
import { FeatureCards } from "@/features/features/components/feature-cards"
import { FeatureRow } from "@/features/features/components/feature-row"
import { FeaturesClosing } from "@/features/features/components/features-closing"
import { FeaturesHero } from "@/features/features/components/features-hero"
import { CornerNet } from "@/features/landing/components/corner-net"
import { LandingSection } from "@/features/landing/components/section"
import { LOCALES } from "@/config/i18n"
import { BAND } from "@/config/landing-backgrounds"
import type { Solution } from "@/config/solutions"
import { visitorCatalog } from "@/lib/catalog"
import { candidatePriceRange } from "@/lib/format"
import { localizedPath } from "@/lib/locale-path"
import { pageMetadata, siteUrl, urlLocale } from "@/lib/site"
import { breadcrumbData, softwareData } from "@/lib/structured-data"

/** A solution page's metadata. */
export async function solutionMetadata({ id, path }: Solution) {
  const t = await getTranslations("solutions")

  return pageMetadata(
    t(`pages.${id}.title`),
    t(`pages.${id}.description`, { count: LOCALES.length }),
    path,
    true
  )
}

/** The page for one term buyers search for, built from the features page's parts: the promise,
 * rows beside pictures of the real app, cards with the links onwards, and the start box. Prices
 * come from the API, and the page shows without them. */
export async function SolutionPage({ solution }: { solution: Solution }) {
  const { id, path } = solution
  const guides = await getTranslations("guides")
  const t = await getTranslations("solutions")
  const common = await getTranslations("common")
  const catalog = await visitorCatalog()
  const price = candidatePriceRange(catalog, await getLocale())
  const site = siteUrl()
  const description = t(`pages.${id}.description`, { count: LOCALES.length })
  const address = localizedPath((await urlLocale()) ?? "en", path)
  const values = {
    count: LOCALES.length,
    price,
    free: catalog?.free_candidates ?? 0,
  }

  return (
    // As wide as the page's box, for the sections' window-wide backgrounds.
    <div className="@container relative">
      <CornerNet />
      <main className="mx-auto max-w-page px-6">
        <JsonLd
          data={breadcrumbData(site, [
            { name: common("home"), path: "/" },
            {
              name: guides("title"),
              path: localizedPath((await urlLocale()) ?? "en", "/guides"),
            },
            { name: t(`pages.${id}.name`), path: address },
          ])}
        />
        {catalog && <JsonLd data={softwareData(site, description, catalog)} />}
        <PageKey page={id} />
        <HeroBack />
        <FeaturesHero
          title={t(`pages.${id}.hero.title`)}
          text={t(`pages.${id}.hero.text`)}
        />
        <LandingSection
          title={t(`pages.${id}.how.title`)}
          text={t(`pages.${id}.how.text`)}
          background={BAND}
        >
          <div className="flex flex-col gap-20 sm:gap-24">
            {solution.rows.map((row, index) => (
              <FeatureRow
                key={row.key}
                title={t(`rows.${row.key}.title`)}
                text={t(`rows.${row.key}.text`)}
                points={row.points.map((point) => t(`points.${point}`, values))}
                shot={row.shot}
                alt={t(`rows.${row.key}.alt`)}
                flip={index % 2 === 1}
              />
            ))}
          </div>
        </LandingSection>
        <LandingSection
          title={t(`pages.${id}.why.title`)}
          text={t(`pages.${id}.why.text`)}
        >
          <div className="flex flex-col items-center gap-10">
            <FeatureCards
              onBand={false}
              cards={solution.cards
                .filter((card) => card.key !== "price" || catalog)
                .map((card) => ({
                  ...card,
                  title: t(`cards.${card.key}.title`, values),
                  text: t(`cards.${card.key}.text`, values),
                }))}
            />
            <div className="flex flex-wrap justify-center gap-3">
              {solution.more.map((link) => (
                <MoreLink key={link.href} href={link.href}>
                  {t(`more.${link.key}`)}
                </MoreLink>
              ))}
            </div>
          </div>
        </LandingSection>
        <FeaturesClosing freeCandidates={catalog?.free_candidates ?? null} />
      </main>
    </div>
  )
}
