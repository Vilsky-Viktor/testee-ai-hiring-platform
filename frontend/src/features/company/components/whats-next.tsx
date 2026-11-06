"use client"

import {
  ChevronRightIcon,
  ListChecksIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { bdi } from "@/lib/bidi"

const ROW = `group/row flex w-full items-center gap-4 px-4 py-3 text-start ${ROW_HOVER}`

/** Right after an interview is generated (the generation page marks the address with `ready`):
 * a dialog with the two things worth adjusting, as rows that take the user there, and trying it
 * as a candidate, the main way on, as inviting comes after both. Closing it takes the mark off the address, so a reload doesn't show
 * it again. */
export function WhatsNext({
  title,
  interviewHref,
}: {
  title: string
  interviewHref: string
}) {
  const t = useTranslations("interviews.whatsNext")
  const interviews = useTranslations("interviews")
  const router = useRouter()
  const [open, setOpen] = useState(true)
  // Where the focus goes once the dialog closes: the first topic's question count, when asked.
  const focusAfter = useRef<HTMLElement | null>(null)
  // The dialog opens on its main button, not its first row.
  const main = useRef<HTMLButtonElement>(null)

  function close() {
    setOpen(false)
    router.replace(interviewHref, { scroll: false })
  }

  function setLimits() {
    focusAfter.current = document.querySelector("[data-topic-limit]")
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        className="sm:max-w-lg"
        data-testid="whats-next"
        initialFocus={main}
        finalFocus={() => focusAfter.current ?? true}
      >
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t.rich("text", {
              title,
              ...bdi,
              name: (chunks) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className={`${LIST_BOX} overflow-hidden`}>
          <button
            type="button"
            onClick={setLimits}
            data-testid="whats-next-limits"
            className={ROW}
          >
            <Step
              icon={ListChecksIcon}
              title={t("limitsAction")}
              text={t("limits")}
            />
          </button>
          <Link
            href={`${interviewHref}?tab=settings`}
            data-testid="whats-next-time"
            className={ROW}
          >
            <Step icon={TimerIcon} title={t("timeAction")} text={t("time")} />
          </Link>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="h-10 px-5 text-base"
            onClick={close}
          >
            {t("done")}
          </Button>
          <Button
            className="h-10 px-5 text-base"
            data-testid="whats-next-try"
            render={<Link href={`${interviewHref}/try`} />}
            nativeButton={false}
            ref={main}
          >
            {interviews("try")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** A step that's up to the user: its icon, title and line, and an arrow on. */
function Step({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon
  title: string
  text: string
}) {
  return (
    <>
      <span aria-hidden className={ROW_ICON}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium lowercase">{title}</span>
        <span className="block text-sm text-muted-foreground normal-case">
          {text}
        </span>
      </span>
      <ChevronRightIcon
        aria-hidden
        className="size-5 shrink-0 text-muted-foreground rtl:-scale-x-100"
      />
    </>
  )
}
