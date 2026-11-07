"use client"

import { cn } from "cn"
import { FlagIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ReactElement, type ReactNode, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FloatingTextarea } from "@/components/ui/floating-field"
import { PillSelect } from "@/components/common/pill-select"
import { FEEDBACK_HOVER_CLASS, REPORT_REASONS } from "@/config/feedback"
import { MAX_REPORT_COMMENT_LENGTH } from "@/config/limits"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import type { ReportReason } from "@/types/feedback"

export function ReportDialog({
  basePath,
  known,
  trigger,
  onReported,
}: {
  basePath: string
  // Whether the user has reported it on this page: reports are anonymous, so the API can't say.
  known?: boolean
  // What opens it, instead of the candidate's flag button; hidden once they've reported.
  trigger?: ReactElement
  onReported?: () => void
}) {
  const t = useTranslations("questions")
  const common = useTranslations("common")
  const reasons = useTranslations("reportReasons")
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | "">("")
  const [comment, setComment] = useState("")
  const [sending, setSending] = useState(false)
  // Callers remount this per question, so the state never carries over.
  const [reported, setReported] = useState(known ?? false)

  function handleOpen(next: boolean) {
    setOpen(next)

    if (!next) {
      setReason("")
      setComment("")
    }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault()

    // Which reasons need details is the API's rule; its message shows if they're missing.
    if (!reason) {
      return
    }

    setSending(true)

    try {
      await apiFetch(`${basePath}/reports`, {
        method: "POST",
        body: JSON.stringify({ reason, comment: comment.trim() }),
      })
      toast.success(t("reported"))
      setReported(true)
      onReported?.()
      handleOpen(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, t("reportFailed")))
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={reported ? t("questionReported") : t("report")}
              className={cn(FEEDBACK_HOVER_CLASS, "h-full w-full rounded-none")}
              aria-pressed={reported}
              disabled={reported}
            />
          )
        }
      >
        {trigger ? (
          (trigger.props as { children?: ReactNode }).children
        ) : (
          <FlagIcon
            className={cn("size-6", reported && "fill-primary text-primary")}
          />
        )}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("report")}</DialogTitle>
          <DialogDescription>{t("whatsWrong")}</DialogDescription>
        </DialogHeader>
        <form id="report-question-form" onSubmit={send} className="space-y-4">
          {/* The site's select, opening the site's menu (not the browser's). */}
          <PillSelect
            label={t("reason")}
            placeholder={t("selectReason")}
            value={reason || null}
            options={REPORT_REASONS.map((key) => ({
              value: key,
              label: reasons(key),
            }))}
            onChange={(next) => setReason(next as ReportReason)}
            pillClassName="h-16"
          />
          <FloatingTextarea
            label={t("details")}
            maxLength={MAX_REPORT_COMMENT_LENGTH}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="min-h-24 resize-none"
          />
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                className="h-10 px-5 text-base"
                disabled={sending}
              />
            }
          >
            {common("cancel")}
          </DialogClose>
          <Button
            type="submit"
            form="report-question-form"
            className="h-10 px-5 text-base"
            disabled={!reason || sending}
          >
            {common("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
