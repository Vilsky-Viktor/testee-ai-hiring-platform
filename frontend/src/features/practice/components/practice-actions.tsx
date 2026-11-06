"use client"

import { HistoryIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { useAuth } from "@/providers/auth-provider"
import { StartPractice } from "@/features/practice/components/start-practice"
import { Button } from "@/components/ui/button"
import type { PracticeTiming } from "@/types/round"

/** A practice test's actions beside its title: the talent's past rounds (signed in), and
 * starting a new round with the time per question they choose. */
export function PracticeActions({
  templateId,
  startLabel,
  timings,
}: {
  templateId: string
  startLabel: string
  timings: PracticeTiming[]
}) {
  const t = useTranslations("practice")
  const { user } = useAuth()

  return (
    <div className="flex shrink-0 items-center gap-3 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
      {user && (
        <Button
          variant="outline"
          className="h-12 shrink-0 px-5 text-base"
          render={<Link href={`/practice/history/${templateId}`} />}
          nativeButton={false}
        >
          <HistoryIcon aria-hidden />
          {t("history")}
        </Button>
      )}
      <StartPractice
        templateId={templateId}
        label={startLabel}
        timings={timings}
      />
    </div>
  )
}
