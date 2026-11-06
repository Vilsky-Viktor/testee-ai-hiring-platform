"use client"

import { cn } from "cn"
import {
  BadgeQuestionMarkIcon,
  CircleQuestionMarkIcon,
  MailIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { CornerSign } from "@/components/common/corner-sign"
import { LocalizedLink } from "@/components/common/localized-link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SIGN_CARD } from "@/config/cards"
import { usePageKey } from "@/hooks/use-page-key"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import type { PageGuide, PageHelpKey } from "@/types/page-help"
import { LoadingSpinner } from "@/components/common/loading-spinner"

/** A page's info button: a muted icon that opens a short guide to the page, which rounds serves
 * (the assistant reads the same): what it's for, what you can do there, a tip or two and, on some
 * pages, a guide article to read more in. It also registers the page's key for the assistant.
 * `className` places it; BackLink puts it under its arrow. With `text`, the hero's button saying
 * so (the home page's "how it works", styles/hero-buttons.css). */
export function PageHelp({
  page,
  text,
  className,
}: {
  page: PageHelpKey
  text?: string
  className?: string
}) {
  const t = useTranslations("pageHelp")
  const common = useTranslations("common")
  const label = t("label")
  // The guide, fetched the first time the dialog opens.
  const [guide, setGuide] = useState<PageGuide | null>(null)
  const [error, setError] = useState<string | null>(null)

  usePageKey(page)

  function load(open: boolean) {
    if (!open || guide?.key === page) {
      return
    }

    setError(null)
    apiFetch<PageGuide>(`/site/help/pages/${page}`)
      .then(setGuide)
      .catch((failure) => setError(apiErrorMessage(failure, common("failed"))))
  }

  const shown = guide?.key === page ? guide : null

  return (
    <Dialog onOpenChange={load}>
      <Tooltip disabled={Boolean(text)}>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <button
                  type="button"
                  aria-label={text ? undefined : label}
                  data-testid="page-help"
                  className={cn(
                    text
                      ? "hero-pill"
                      : "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    className
                  )}
                />
              }
            />
          }
        >
          {text ? (
            <>
              <span aria-hidden className="hero-pill-disc">
                <CircleQuestionMarkIcon
                  strokeWidth={1.5}
                  className="size-7.5 sm:size-9"
                />
              </span>
              <span className="hero-pill-label">{text}</span>
            </>
          ) : (
            <BadgeQuestionMarkIcon aria-hidden className="size-6" />
          )}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      {/* On phones it fills the screen: the guide scrolls, Close stays at the bottom. */}
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] max-sm:h-dvh max-sm:max-h-dvh sm:max-w-2xl"
        bodyClassName="gap-6"
      >
        <DialogHeader>
          <DialogTitle>{shown?.title ?? label}</DialogTitle>
        </DialogHeader>
        {shown ? (
          <>
            <p className="text-base text-muted-foreground">{shown.text}</p>
            <HelpList title={t("actionsTitle")} items={shown.actions} />
            <HelpList title={t("tipsTitle")} items={shown.tips} />
            {shown.article && (
              <LocalizedLink
                href={shown.article.path}
                className="text-base text-primary hover:underline"
              >
                {shown.article.title}
              </LocalizedLink>
            )}
          </>
        ) : error ? (
          <p role="status" className="text-base text-destructive">
            {error}
          </p>
        ) : (
          <LoadingSpinner label={common("loading")} compact />
        )}
        <FeedbackCard />
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" className="h-10 px-5 text-base" />
            }
          >
            {common("close")}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function HelpList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="space-y-2">
      <h3 className="text-lg font-medium">{title}</h3>
      <ul className="list-disc space-y-1.5 ps-5 text-base text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

/** The invitation at every guide's end to tell us what's wrong or missing, with the way to the
 * contact page on its end side. Built like the content pages' start card. */
function FeedbackCard() {
  const t = useTranslations("pageHelp")

  return (
    <div
      data-testid="page-help-feedback"
      className={cn(
        SIGN_CARD,
        "-mx-10 mb-10 flex min-h-max shrink-0 flex-col gap-4 rounded-none sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <CornerSign>
        <MailIcon className="text-primary" />
      </CornerSign>
      <p className="text-base text-muted-foreground">{t("feedbackText")}</p>
      <Button
        className="h-10 shrink-0 px-5 text-base"
        render={<LocalizedLink href="/contact" />}
        nativeButton={false}
      >
        {t("feedbackLink")}
      </Button>
    </div>
  )
}
