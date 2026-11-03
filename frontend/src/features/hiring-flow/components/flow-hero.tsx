import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { MoreLink } from "@/components/common/more-link"
import { buttonVariants } from "@/components/ui/button"

/** The flow page's first screen, like the features page's: a two-line promise, each line ending
 * with the logo's blue dot, a short text, the way to the start box at the page's end and to the
 * features, and an arrow down to the line. */
export async function FlowHero() {
  const t = await getTranslations("hiringFlow.hero")

  return (
    <header className="flex flex-col items-center gap-10 pt-20 pb-8 text-center sm:pt-28">
      <div className="max-w-3xl space-y-5">
        <h1 className="no-dot font-heading text-[min(3rem,10.5vw)] leading-none font-medium tracking-tight text-balance sm:text-6xl">
          {t("title")
            .split("\n")
            .map((line) => (
              <span key={line} className="block">
                {line}
                <span className="blue-dot">.</span>
              </span>
            ))}
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-balance text-muted-foreground sm:text-xl">
          {t("text")}
        </p>
      </div>
      <div className="flex justify-center gap-3 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
        <a href="#start" className={cn(buttonVariants(), "h-14 px-10 text-lg")}>
          {t("start")}
        </a>
        <MoreLink href="/features" className="h-14 px-10 text-lg">
          {t("features")}
        </MoreLink>
      </div>
      <ChevronDownIcon
        aria-hidden
        className="size-10 animate-bounce text-muted-foreground"
      />
    </header>
  )
}
