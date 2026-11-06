import { getTranslations } from "next-intl/server"

import { AskAgentButton } from "@/components/common/ask-agent-button"
import { FaqList } from "@/components/common/faq-list"
import { FilterPills } from "@/components/common/filter-pills"
import { JsonLd } from "@/components/common/json-ld"
import { LocalizedLink } from "@/components/common/localized-link"
import { Button } from "@/components/ui/button"
import { CARD } from "@/config/cards"
import { FAQ_GROUPS } from "@/config/faq"
import { faqPath } from "@/lib/catalog"
import { plainAnswer } from "@/lib/markdown"
import { publicFetch } from "@/lib/server-api"
import { pageMetadata } from "@/lib/site"
import type { FaqItem } from "@/types/help"
import { PageKey } from "@/components/common/page-key"

/** The questions by group, none lost: one not listed joins the last group, and an empty group
 * isn't shown. */
function faqGroups(items: FaqItem[]) {
  const listed = new Set<string>(FAQ_GROUPS.flatMap((group) => group.keys))
  const last = FAQ_GROUPS[FAQ_GROUPS.length - 1]

  return FAQ_GROUPS.map(({ id, keys }) => ({
    id,
    questions: [
      ...keys.flatMap((key) => items.filter((item) => item.key === key)),
      ...(id === last.id ? items.filter((item) => !listed.has(item.key)) : []),
    ],
  })).filter(({ questions }) => questions.length > 0)
}

export async function generateMetadata() {
  const t = await getTranslations("faq")

  return pageMetadata(t("title"), t("description"), "/faq", true)
}

export default async function FaqPage() {
  const t = await getTranslations("faq")
  const nav = await getTranslations("nav")
  // The questions come from the site service in the page's language, with today's prices in
  // the visitor's currency.
  const items = (await publicFetch<FaqItem[]>(await faqPath())) ?? []
  const groups = faqGroups(items)
  // FAQ structured data, so search engines can show the answers.
  const structured = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: plainAnswer(item.answer) },
    })),
  }

  return (
    <main className="mx-auto max-w-page space-y-10 px-6 py-12">
      <PageKey page="faq" />
      {/* None without questions: an empty FAQPage is invalid. */}
      {items.length > 0 && <JsonLd data={structured} />}
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("title")}
        </h1>
        <p className="text-base text-muted-foreground">{t("intro")}</p>
      </header>
      {/* Each pill jumps to its group. */}
      <FilterPills
        testId="faq-groups"
        items={groups.map(({ id }) => ({
          id,
          label: t(`groups.${id}`),
          href: `#${id}`,
          chosen: false,
        }))}
      />
      {groups.map(({ id, questions }) => (
        <section key={id} id={id} className="scroll-mt-24 space-y-4">
          <h2 className="font-heading text-2xl font-medium">
            {t(`groups.${id}`)}
          </h2>
          <FaqList items={questions} />
        </section>
      ))}
      <section
        data-testid="faq-closing"
        className={`flex items-center justify-between gap-6 max-sm:-mx-6 max-sm:flex-col max-sm:items-stretch max-sm:rounded-none ${CARD}`}
      >
        <div className="min-w-0 space-y-1">
          <h2 className="no-dot font-heading text-2xl font-medium">
            {t("closingTitle")}
          </h2>
          <p className="text-base text-muted-foreground">{t("closingText")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 max-sm:flex-col max-sm:items-stretch">
          <AskAgentButton className="h-12 px-6 text-base" />
          <Button
            variant="outline"
            className="h-12 px-6 text-base"
            render={<LocalizedLink href="/contact" />}
            nativeButton={false}
          >
            {nav("contact")}
          </Button>
        </div>
      </section>
    </main>
  )
}
