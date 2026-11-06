"use client"

import { useTranslations } from "next-intl"
import { type ReactNode, useEffect } from "react"

import { AiPulse } from "@/components/common/ai-pulse"
import { BackLink } from "@/components/common/back-link"
import { LocalizedLink } from "@/components/common/localized-link"
import { Button } from "@/components/ui/button"
import { WritingProgress } from "@/components/common/writing-progress"
import { DOT_CLASS } from "@/config/dot"
import type { Generation } from "@/types/generation"

/** A generation under way, on a line its `company` and the `job` description it's made from, where
 * known: its topics being drafted, then its questions being written, a bar filling, with
 * `leaveLabel`'s button to leave by. Without a
 * `generation`, the interview is still being started, so there's nothing to cancel yet: the
 * `action`'s room stays kept, so nothing moves when it comes. */
export function GenerationProgress({
  generation,
  backHref,
  backLabel,
  leaveLabel,
  company,
  job,
  action,
}: {
  generation: Generation | null
  backHref?: string
  backLabel?: string
  leaveLabel?: string
  company?: string
  job?: string | null
  action?: ReactNode
}) {
  const t = useTranslations("generation")

  // Shown from the top, the header in view; the page then holds still (data-page-still).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const progress = generation?.progress ?? null
  const writing = progress !== null && progress.total > 0

  // The room stays kept while there's nothing to cancel yet, so nothing moves when it comes.
  const actions = (
    <div className="flex min-h-12 flex-wrap justify-center gap-3">
      {action}
      {writing && backHref && leaveLabel && (
        <Button
          variant="outline"
          className="h-12 px-6 text-base"
          render={<LocalizedLink href={backHref} />}
          nativeButton={false}
        >
          {leaveLabel}
        </Button>
      )}
    </div>
  )

  return (
    <div
      // Drafting fills the screen and holds still; the topics being written may need scrolling.
      data-page-still={writing ? undefined : true}
      className="flex flex-1 flex-col"
    >
      {/* At the page's top, as on other pages; in its margin on wide screens. */}
      {backHref && (
        <div className="relative min-h-12">
          <BackLink href={backHref} help="generating">
            {backLabel}
          </BackLink>
        </div>
      )}
      <div className="flex flex-1 flex-col items-center justify-center space-y-8 text-center">
        <AiPulse className="size-28" />
        <div className="w-full space-y-4">
          <h1 className="font-heading text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            {writing ? t("writing") : t("drafting")}
          </h1>
          <Subject company={company} job={job} />
          <p className="mx-auto max-w-xl text-base text-balance text-muted-foreground">
            {writing ? t("writingNote") : t("draftingNote")}
          </p>
        </div>
        {writing ? (
          <WritingProgress progress={progress}>{actions}</WritingProgress>
        ) : (
          actions
        )}
      </div>
    </div>
  )
}

/** What's being generated: the company and, cut to one line, the job description, a dot between. */
function Subject({ company, job }: { company?: string; job?: string | null }) {
  return (
    <p className="mx-auto flex min-h-6 max-w-2xl items-center justify-center text-base">
      {company && <span className="shrink-0 font-medium">{company}</span>}
      {company && job && <span aria-hidden className={DOT_CLASS} />}
      {job && (
        <span dir="auto" className="truncate text-muted-foreground">
          {job}
        </span>
      )}
    </p>
  )
}
