import { getTranslations } from "next-intl/server"

import { ContactForm } from "@/components/common/contact-form"
import { OPERATOR } from "@/config/operator"
import { pageMetadata } from "@/lib/site"
import { PageKey } from "@/components/common/page-key"
import { InfoCard } from "@/components/common/warning-card"
import { TEXT_LINK } from "@/config/links"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"

export async function generateMetadata() {
  const t = await getTranslations("contact")

  return pageMetadata(t("title"), t("description"), "/contact", true)
}

export default async function ContactPage() {
  const t = await getTranslations("contact")

  return (
    <main className="mx-auto max-w-page space-y-10 px-6 py-12">
      <PageKey page="contact" />
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("title")}
        </h1>
        <p className="text-base text-muted-foreground">{t("intro")}</p>
      </header>
      {/* The form first, wide, with what helps beside it; under it on narrower screens. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <ContactForm />
        <div className="space-y-4">
          {/* What to quote, so support finds what the message is about at once. */}
          <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
            {t("idHint")}
          </InfoCard>
          {/* Who runs testee, as the site's rows. */}
          <dl
            data-testid="contact-company"
            className={`${LIST_BOX} overflow-hidden`}
          >
            {(
              [
                ["name", OPERATOR.name],
                ["code", OPERATOR.registryCode],
                ["address", OPERATOR.address],
                ["email", OPERATOR.email],
              ] as const
            ).map(([key, value]) => (
              <div key={key} className={`space-y-0.5 px-6 py-3 ${ROW_HOVER}`}>
                <dt className="text-sm text-muted-foreground">
                  {t(`company.${key}`)}
                </dt>
                <dd className="text-base break-words">
                  {key === "email" ? (
                    <a href={`mailto:${value}`} className={TEXT_LINK}>
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  )
}
