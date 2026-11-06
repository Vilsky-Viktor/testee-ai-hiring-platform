"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { DayField } from "@/components/common/day-field"
import { PillChoice } from "@/components/common/pill-choice"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DOWNLOAD_PERIOD_DAYS } from "@/config/lists"
import { apiErrorMessage } from "@/lib/api"
import { downloadFile } from "@/lib/download"
import { dayStart } from "@/lib/format"

type Period = "all" | "custom" | `${number}`

/** The day `days` before today, as a day field holds it. */
function daysAgo(days: number) {
  const day = new Date()
  day.setDate(day.getDate() - days)

  return day.toLocaleDateString("sv")
}

/** A popup that downloads the CSV file the API makes at `path`: of all time, a recent period, or
 * from and to chosen days. `children` go above the period (more to choose, sent as `params`) and
 * `note` under it. */
export function DownloadDialog({
  open,
  onOpenChange,
  path,
  texts,
  params = {},
  children,
  note,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  path: string
  texts: { title: string; description: string; save: string; failed: string }
  params?: Record<string, string>
  children?: React.ReactNode
  note?: React.ReactNode
}) {
  const log = useTranslations("actionLog")
  const common = useTranslations("common")
  const [period, setPeriod] = useState<Period>("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [busy, setBusy] = useState(false)
  const custom = period === "custom"
  // Days in the wrong order would find nothing.
  const backwards = custom && Boolean(from && to) && from > to

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    const query = new URLSearchParams(params)
    const start = custom
      ? from
      : period === "all"
        ? ""
        : daysAgo(Number(period))

    if (start) {
      query.set("from", dayStart(start))
    }

    if (custom && to) {
      query.set("to", dayStart(to, 1))
    }

    try {
      await downloadFile(`${path}?${query}`)
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, texts.failed))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{texts.title}</DialogTitle>
          <DialogDescription>{texts.description}</DialogDescription>
        </DialogHeader>
        <form
          id="download-form"
          className="flow-root space-y-5"
          onSubmit={save}
        >
          {children}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{log("period")}</p>
            <PillChoice
              testId="download-period"
              options={[
                { value: "all", label: log("periodAll") },
                ...DOWNLOAD_PERIOD_DAYS.map((days) => ({
                  value: `${days}` as Period,
                  label: log("periodDays", { days }),
                })),
                { value: "custom", label: log("periodCustom") },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </div>
          {custom && (
            <div className="grid gap-4 sm:grid-cols-2">
              <DayField label={log("from")} value={from} onChange={setFrom} />
              <DayField label={log("to")} value={to} onChange={setTo} />
            </div>
          )}
          {note}
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                className="h-10 px-5 text-base"
                disabled={busy}
              />
            }
          >
            {common("cancel")}
          </DialogClose>
          <Button
            type="submit"
            form="download-form"
            className="h-10 px-5 text-base"
            disabled={busy || backwards}
          >
            {busy && <LoaderCircleIcon className="animate-spin" />}
            {texts.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
