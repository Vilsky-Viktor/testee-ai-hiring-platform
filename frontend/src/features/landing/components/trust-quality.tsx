import { getTranslations } from "next-intl/server"

import { KeepAcronyms } from "@/components/common/keep-acronyms"
import { DEMO_GROUP } from "@/features/landing/components/demo-panel"
import { PhoneSteps } from "@/features/landing/components/phone-steps"
import { QualityLoop } from "@/features/landing/components/quality-loop"
import { LandingSection } from "@/features/landing/components/section"
import { TrustCards } from "@/features/landing/components/trust-cards"
import { LocalizedLink } from "@/components/common/localized-link"
import {
  QUALITY_ICONS,
  QUALITY_STEPS,
  type QualityStep,
  TRUST_CARDS,
} from "@/config/trust-quality-demo"
import { TEXT_LINK } from "@/config/links"

/** Trust, quality and compliance: the loop that keeps questions good, and what keeps the
 * hiring fair and lawful under it, with links to the documents. On phones, the loop's steps as
 * cards, one under another. The loop and the columns pop in as they come into view. */
export async function TrustQualitySection() {
  const t = await getTranslations("landing.trustQuality")
  const steps = (part: "labels" | "lines") =>
    Object.fromEntries(
      QUALITY_STEPS.map((key) => [key, t(`steps.${key}.${part}`)])
    ) as Record<QualityStep, string>
  const link = (href: string) =>
    function DocumentLink(chunks: React.ReactNode) {
      return (
        <LocalizedLink href={href} className={TEXT_LINK}>
          {chunks}
        </LocalizedLink>
      )
    }

  return (
    <LandingSection id="trust" title={t("title")} text={t("text")}>
      {/* A promo: its pictures pop in as they come into view (animations.css). */}
      <div data-promo className="flex flex-col gap-14">
        <div className={`${DEMO_GROUP} max-sm:hidden`}>
          <QualityLoop labels={steps("labels")} lines={steps("lines")} />
        </div>
        <PhoneSteps
          steps={QUALITY_STEPS.map((key) => ({
            key,
            icon: QUALITY_ICONS[key],
            title: t(`steps.${key}.labels`),
            text: t(`steps.${key}.lines`),
          }))}
        />
        <TrustCards
          cards={TRUST_CARDS.map((key) => ({
            key,
            content: (
              <>
                <h3 className="font-heading text-xl font-medium lowercase">
                  <KeepAcronyms text={t(`cards.${key}.title`)} />
                  <span className="blue-dot">.</span>
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {key === "laws"
                    ? t.rich("cards.laws.text", {
                        documents: link("/documents"),
                      })
                    : t(`cards.${key}.text`)}
                </p>
              </>
            ),
          }))}
        />
      </div>
    </LandingSection>
  )
}
