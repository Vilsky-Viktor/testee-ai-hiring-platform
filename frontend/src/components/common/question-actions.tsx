"use client"

import { useTranslations } from "next-intl"

import { QuestionRating } from "@/components/common/question-rating"
import { ReportDialog } from "@/components/common/report-dialog"

/** Rating a question and reporting it, small: the answers come first. */
export function QuestionActions({
  basePath,
}: {
  // The question's rating and reports, under the session it was asked in.
  basePath: string
}) {
  const t = useTranslations("questions")

  return (
    <div className="flex items-center justify-center gap-3 text-muted-foreground">
      <p className="text-xs">{t("goodQuestion")}</p>
      <div className="grid h-9 w-28 grid-cols-3 overflow-hidden rounded-lg border [&_svg]:size-4!">
        <QuestionRating basePath={basePath} />
        <ReportDialog basePath={basePath} />
      </div>
    </div>
  )
}
