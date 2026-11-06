"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { CHAT_APPS } from "@/components/common/chat-apps"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FloatingInput } from "@/components/ui/floating-field"
import { MAX_EMAIL_LENGTH } from "@/config/limits"
import { apiFetch, serviceRefusal } from "@/lib/api"
import { bdi } from "@/lib/bidi"
import { fileBase64 } from "@/lib/files"
import { useOrigin } from "@/lib/origin"

/** Sends a PDF report by email from testee (a reply goes to the member), or a text
 * summary through a chat app (WhatsApp, Telegram, Viber, LINE), which can't carry a file. */
export function ShareReport({
  open,
  onOpenChange,
  path,
  summary,
  makePdf,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The API path that emails the report.
  path: string
  // The chat message, for the chat apps.
  summary: string
  makePdf: () => Promise<File | null>
}) {
  const t = useTranslations("report")
  const common = useTranslations("common")
  const origin = useOrigin()
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)

  async function send(event: React.FormEvent) {
    event.preventDefault()
    setSending(true)

    try {
      const file = await makePdf()

      if (!file) {
        return
      }

      await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ email, pdf: await fileBase64(file) }),
      })
      toast.success(t.rich("sent", { email, ...bdi }))
      setEmail("")
      onOpenChange(false)
    } catch (error) {
      // A viewer's address outside the company, nothing to report yet, or too many emails: the
      // API's message says why.
      toast.error(serviceRefusal(error, [403, 409, 429]) ?? t("sendFailed"))
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !sending && onOpenChange(next)}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("shareTitle")}</DialogTitle>
        </DialogHeader>
        <form id="share-report-form" onSubmit={send} className="flow-root">
          <FloatingInput
            label={t("recipient")}
            type="email"
            required
            autoComplete="off"
            maxLength={MAX_EMAIL_LENGTH}
            placeholder="manager@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            action={
              <Button
                type="submit"
                className="h-10 shrink-0 rounded-lg px-4 text-base"
                disabled={sending || !email}
              >
                {sending && <LoaderCircleIcon className="animate-spin" />}
                {/* PDF keeps its capitals inside the lowercase button; one span keeps the
                    spacing. */}
                <span>
                  {t.rich("send", {
                    name: (chunks) => (
                      <span className="normal-case">{chunks}</span>
                    ),
                  })}
                </span>
              </Button>
            }
          />
        </form>
        {/* Chats can't carry the PDF, so they get a text summary. */}
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            {t("orSummary")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {CHAT_APPS.map(({ name, Icon, link }) => (
              <Button
                key={name}
                variant="outline"
                className="h-12 gap-2 px-2 text-base normal-case"
                render={
                  <a
                    href={link(summary, origin)}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
              >
                <Icon className="size-6" />
                {name}
              </Button>
            ))}
          </div>
        </div>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
