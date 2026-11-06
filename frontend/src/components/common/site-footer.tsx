import { getTranslations } from "next-intl/server"

import {
  FacebookIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons/brand-icons"
import { FooterLink } from "@/components/common/footer-link"
import { LanguageSwitch } from "@/components/common/language-switch"
import { LocalizedLink } from "@/components/common/localized-link"
import { ThemeModes } from "@/components/common/theme-toggle"
import { Wordmark } from "@/components/common/wordmark"
import { FOOTER_COLUMNS, FOOTER_LEGAL } from "@/config/navigation"
import { OPERATOR } from "@/config/operator"

// A social icon: the text colour (white in dark) and a little larger on hover.
const SOCIAL =
  "inline-flex transition-[color,scale] duration-200 hover:scale-110 hover:text-foreground"

export async function SiteFooter() {
  const t = await getTranslations("nav")
  const tc = await getTranslations("common")

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-page space-y-8 px-6 pt-10 pb-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap justify-between gap-x-16 gap-y-8">
          <div className="max-w-xs space-y-4">
            {/* The logo, as in the header, leading home. */}
            <LocalizedLink href="/" className="inline-flex text-foreground">
              <Wordmark className="text-2xl leading-none" />
              <span className="sr-only"> {tc("home")}</span>
            </LocalizedLink>
            <p className="text-base">{t("footerTagline")}</p>
            {/* testee's social accounts; links come once the accounts exist. */}
            <div className="flex items-center gap-5 max-sm:gap-8">
              <span role="img" aria-label="LinkedIn" className={SOCIAL}>
                <LinkedInIcon className="size-6 max-sm:size-8" />
              </span>
              <span role="img" aria-label="X" className={SOCIAL}>
                <XIcon className="size-6 max-sm:size-8" />
              </span>
              <span role="img" aria-label="YouTube" className={SOCIAL}>
                <YouTubeIcon className="size-6 max-sm:size-8" />
              </span>
              <span role="img" aria-label="Facebook" className={SOCIAL}>
                <FacebookIcon className="size-6 max-sm:size-8" />
              </span>
            </div>
          </div>
          {/* Lowercase with the blue dot, like the header's menu (globals.css, by data-slot); on
              phones two columns, so the footer stays short. */}
          <nav
            data-slot="footer-nav"
            aria-label={t("footer")}
            className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-8 [overflow-wrap:anywhere] hyphens-auto sm:max-w-3xl sm:grid-cols-3 lg:gap-x-10"
          >
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="font-medium text-foreground">{t(column.title)}</p>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <FooterLink href={link.href}>{t(link.label)}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        {/* The operator, as EU rules want it within reach of every page, the page's language and
            theme, and the legal links. */}
        <div
          data-footer-bar
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-5"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>
              © {new Date().getFullYear()} {OPERATOR.name}
            </span>
            <LanguageSwitch />
            <div className="w-32">
              <ThemeModes />
            </div>
          </div>
          <nav data-slot="footer-nav" aria-label={t("footerLegal")}>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {FOOTER_LEGAL.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{t(link.label)}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
