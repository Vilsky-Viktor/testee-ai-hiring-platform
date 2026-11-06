import { getTranslations } from "next-intl/server"

import { CandidatesSection } from "@/features/landing/components/candidates"
import { Closing } from "@/features/landing/components/closing"
import { ComparisonSection } from "@/features/landing/components/comparison"
import { CreateSection } from "@/features/landing/components/create"
import { FreeToStartSection } from "@/features/landing/components/free-to-start"
import { ShareReportsSection } from "@/features/landing/components/share-reports"
import { InviteFromSection } from "@/features/landing/components/invite-from"
import { JustAskSection } from "@/features/landing/components/just-ask"
import { TrustQualitySection } from "@/features/landing/components/trust-quality"
import { VideoButton } from "@/features/landing/components/video-button"
import { JsonLd } from "@/components/common/json-ld"
import { PageHelp } from "@/components/common/page-help"
import { NotesLine } from "@/features/landing/components/notes-line"
import { HeroNets } from "@/features/landing/components/hero-nets"
import {
  HeroWireOut,
  HeroWiresIn,
} from "@/features/landing/components/hero-wires"
import { StartTest } from "@/components/common/start-test"
import { LOCALES } from "@/config/i18n"
import { READY_MINUTES } from "@/config/landing"
import { SITE_NAME } from "@/config/seo"
import { pageMetadata, siteUrl } from "@/lib/site"
import { organizationData } from "@/lib/structured-data"
import { countryCatalog, priceValues, visitorCatalog } from "@/lib/catalog"

export async function generateMetadata() {
  const t = await getTranslations("site")

  // The layout's title template doesn't reach its own segment's page: the brand is added here.
  return pageMetadata(
    `${t("homeTitle")} · ${SITE_NAME}`,
    t("description", await priceValues(await countryCatalog())),
    "/",
    true
  )
}

export default async function HomePage() {
  const t = await getTranslations("home")
  const site = await getTranslations("site")
  const landing = await getTranslations("landing")
  // Asked together. Without prices (billing is slow or down) the page still shows, without the
  // free offer.
  const [catalog, countryPrices] = await Promise.all([
    visitorCatalog(),
    countryCatalog().then(priceValues),
  ])
  const freeCandidates = catalog?.free_candidates ?? null

  return (
    // As wide as the page's box (the window less a scrollbar's gutter), for the sections'
    // window-wide backgrounds (config/landing-backgrounds.ts); what runs past it (the hero's nets)
    // is cut off there, so the page has nothing to scroll sideways to.
    <div className="@container overflow-x-clip">
      <main className="mx-auto max-w-page px-6">
        <JsonLd
          data={organizationData(siteUrl(), site("description", countryPrices))}
        />
        {/* The promise on one side and the box to start in on the other, filling the first screen
          under the 3.5rem header: from laptops up, the box's column runs the screen's height, the
          wires in the room above and under the box. Stacked below that. */}
        <div className="relative grid min-h-[calc(100svh-3.5rem)] content-center gap-10 py-10 lg:grid-cols-2 lg:content-stretch lg:gap-16 lg:py-0">
          <HeroNets />
          <div data-hero-content className="space-y-4 self-center">
            {/* Two lines, each ending with the logo's blue dot; close together, with room for
              marks above and below in Arabic, Persian, Hindi, Thai and Vietnamese. */}
            <h1 className="no-dot font-heading text-[min(3rem,10.5vw)] leading-none font-medium tracking-tight text-balance sm:text-6xl [:lang(ar)_&]:leading-tight [:lang(fa)_&]:leading-tight [:lang(hi)_&]:leading-tight [:lang(th)_&]:leading-tight [:lang(vi)_&]:leading-tight">
              {t("title")
                .split("\n")
                .map((line) => (
                  <span key={line} className="block">
                    {line}
                    <span className="blue-dot">.</span>
                  </span>
                ))}
            </h1>
            <p
              className="text-lg text-balance text-muted-foreground"
              data-testid="hero-text"
            >
              {t("text")}
            </p>
            {/* The ways to learn more before starting: the page's guide and the video. */}
            <div className="flex flex-wrap gap-3 pt-2">
              <PageHelp page="landing" text={landing("howItWorks")} />
              <VideoButton />
            </div>
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="relative hidden flex-1 lg:block">
              <HeroWiresIn />
            </div>
            <div data-hero-content className="relative">
              <StartTest hero />
            </div>
            {/* What a company gets, in short, under the box: from laptops up one under another,
              to the right of the wire running down from the box, halfway to the window's bottom. */}
            <div className="relative flex flex-1 flex-col pt-5 lg:pt-0">
              <HeroWireOut />
              <div
                data-hero-content
                className="relative lg:my-auto lg:ms-[50%] lg:ps-6 lg:[&>ul]:flex-col lg:[&>ul]:items-start"
              >
                <NotesLine
                  testId="hero-proof"
                  notes={[
                    landing("proof.anyJob"),
                    landing("proof.languages", { count: LOCALES.length }),
                    landing("proof.ready", { minutes: READY_MINUTES }),
                    landing("proof.noSubscription"),
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <CreateSection />
        <CandidatesSection />
        <ShareReportsSection />
        {catalog && <ComparisonSection catalog={catalog} />}
        {catalog && <FreeToStartSection catalog={catalog} />}
        <InviteFromSection />
        <JustAskSection />
        <TrustQualitySection />
        <Closing freeCandidates={freeCandidates} />
      </main>
    </div>
  )
}
