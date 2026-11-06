import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { LinkedInIcon } from "@/components/icons/brand-icons"
import { Button } from "@/components/ui/button"
import { LocalizedLink } from "@/components/common/localized-link"
import { JsonLd } from "@/components/common/json-ld"
import { FOUNDER } from "@/config/about"
import { pageMetadata, siteUrl } from "@/lib/site"
import { personData } from "@/lib/structured-data"
import { PageKey } from "@/components/common/page-key"
import { CARD } from "@/config/cards"

// Why testee exists.
const REASONS = ["problem", "approach", "practice"] as const

export async function generateMetadata() {
  const t = await getTranslations("about")

  return pageMetadata(t("title"), t("description"), "/about", true)
}

export default async function AboutPage() {
  const t = await getTranslations("about")

  return (
    <main className="mx-auto max-w-page space-y-12 px-6 py-12">
      <PageKey page="about" />
      <JsonLd data={personData(siteUrl())} />
      <header className="mx-auto max-w-5xl space-y-4">
        {/* The way back home, beside the title as on the app's pages. */}
        <div className="relative">
          <BackLink href="/">{null}</BackLink>
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            {t("title")}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">{t("intro")}</p>
      </header>
      <section className="mx-auto max-w-5xl space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          {t("company.title")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3" data-testid="about-reasons">
          {REASONS.map((key) => (
            <article key={key} className="space-y-3 rounded-xl bg-surface p-6">
              <h3 className="font-heading text-lg font-medium">
                {t(`company.titles.${key}`)}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t(`company.${key}`)}
              </p>
            </article>
          ))}
        </div>
      </section>
      {/* The photo fills the card's start, full height; above the quote on phones. */}
      <figure className="mx-auto grid max-w-5xl overflow-hidden rounded-xl border md:grid-cols-[18rem_minmax(0,1fr)]">
        <Image
          src={FOUNDER.photo}
          width={FOUNDER.width}
          height={FOUNDER.height}
          alt={FOUNDER.name}
          // As wide as the page's column on phones (less its 1.5rem sides), 18rem from tablets up.
          sizes="(min-width: 768px) 18rem, calc(100vw - 3rem)"
          className="aspect-[4/3] size-full object-cover object-top md:aspect-auto"
        />
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8">
          <blockquote className="text-xl leading-relaxed sm:text-2xl">
            {/* <q> takes the quotation marks of the page's language: “…”, «…», „…“, 「…」. */}
            <q>{t("founder.quote")}</q>
          </blockquote>
          <figcaption className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-medium">{FOUNDER.name}</span>
              <span className="block text-sm text-muted-foreground">
                {t("founder.role")}
              </span>
            </span>
            <Button
              variant="outline"
              className="h-10 shrink-0 px-4 text-base normal-case"
              nativeButton={false}
              render={
                <a
                  href={FOUNDER.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <LinkedInIcon className="size-5" />
              LinkedIn
            </Button>
          </figcaption>
        </div>
      </figure>
      <section
        data-testid="about-closing"
        className={`mx-auto flex max-w-5xl items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch ${CARD}`}
      >
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-2xl font-medium">
            {t("closing.title")}
          </h2>
          <p className="text-base text-muted-foreground">{t("closing.text")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 max-sm:flex-col max-sm:items-stretch">
          <Button
            className="h-12 px-6 text-base"
            render={<LocalizedLink href="/" />}
            nativeButton={false}
          >
            {t("closing.create")}
          </Button>
          <Button
            variant="outline"
            className="h-12 px-6 text-base"
            render={<LocalizedLink href="/practice" />}
            nativeButton={false}
          >
            {t("closing.practice")}
          </Button>
        </div>
      </section>
    </main>
  )
}
