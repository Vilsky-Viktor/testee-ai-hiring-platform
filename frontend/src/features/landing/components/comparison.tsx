import { cn } from "cn"
import {
  CalendarSyncIcon,
  CheckIcon,
  PhoneIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { MoreLink } from "@/components/common/more-link"
import { Wordmark } from "@/components/common/wordmark"
import { ComparisonCards } from "@/features/landing/components/comparison-cards"
import { LandingSection } from "@/features/landing/components/section"
import { COMPARED } from "@/config/comparison"
import { PRIMARY_FILL } from "@/config/buttons"
import { candidatePriceRange } from "@/lib/format"
import type { Catalog } from "@/types/billing"

const ICONS: Record<
  Exclude<(typeof COMPARED)[number], "testee">,
  LucideIcon
> = {
  phone: PhoneIcon,
  subscription: CalendarSyncIcon,
}

/** testee beside the usual ways to screen candidates: a card each with what it checks, what it
 * takes of your time and what you pay, a quiet cross by each of the others' facts; testee's last
 * (on phones first, the others shorter under it, without the facts' names), the winner: taller,
 * tinted, ringed, its logo and a "best choice" pill, a check by each fact, coming in as the section
 * is scrolled to; then a link to the comparisons with other tools. testee's price range per
 * candidate comes from billing's catalog. */
export async function ComparisonSection({ catalog }: { catalog: Catalog }) {
  const t = await getTranslations("landing.comparison")
  const locale = await getLocale()
  const price = candidatePriceRange(catalog, locale)

  return (
    <LandingSection id="compare" title={t("title")} text={t("text")}>
      <div className="flex flex-col items-center gap-10">
        <ComparisonCards
          cards={COMPARED.map((key) => {
            const ours = key === "testee"
            const Icon = ours ? null : ICONS[key]
            const Mark = ours ? CheckIcon : XIcon

            return {
              key,
              className: cn(
                "relative flex flex-col rounded-xl p-6 sm:p-8 md:gap-6 lg:p-10",
                ours
                  ? // The winner: taller than the others above and below, faintly tinted, ringed.
                    "border-primary-gradient gap-6 bg-[color-mix(in_oklch,var(--primary)_6%,var(--background))] max-md:order-first md:-my-6 md:py-12 lg:py-14"
                  : "gap-3 bg-surface"
              ),
              content: (
                <>
                  {/* testee's pill astride its top edge. */}
                  {ours && (
                    <span
                      className={`absolute start-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1 text-sm font-medium whitespace-nowrap lowercase rtl:translate-x-1/2 ${PRIMARY_FILL}`}
                    >
                      {t("best")}
                    </span>
                  )}
                  <div className="flex min-h-8 items-center gap-3">
                    {Icon && (
                      <Icon className="size-6 shrink-0 text-muted-foreground" />
                    )}
                    {ours ? (
                      <Wordmark className="text-3xl" />
                    ) : (
                      <span className="font-heading text-xl font-medium text-muted-foreground lowercase">
                        {t(`${key}.name`)}
                      </span>
                    )}
                  </div>
                  {(["checks", "time", "cost"] as const).map((fact) => (
                    <div key={fact} className="space-y-1">
                      <p
                        className={cn(
                          "text-sm text-muted-foreground",
                          !ours && "max-md:hidden"
                        )}
                      >
                        {t(fact)}
                      </p>
                      <p
                        className={cn(
                          "flex items-start gap-2 leading-snug md:text-lg",
                          ours
                            ? "text-lg font-medium text-primary"
                            : "text-foreground/80"
                        )}
                      >
                        {/* A check for testee, a quiet cross for the others. */}
                        <Mark
                          aria-hidden
                          className={cn(
                            "mt-1 size-5 shrink-0",
                            ours ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span>{t(`${key}.${fact}`, { price })}</span>
                      </p>
                    </div>
                  ))}
                </>
              ),
            }
          })}
        />
        <MoreLink href="/compare">{t("more")}</MoreLink>
      </div>
    </LandingSection>
  )
}
