"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FloatingTextarea } from "@/components/ui/floating-field"
import { MAX_NOTE_LENGTH } from "@/config/limits"
import { apiErrorMessage, serviceRefusal } from "@/lib/api"
import { SubmitHint } from "@/components/common/submit-hint"
import { isSubmitShortcut } from "@/lib/keys"

/** A note's text box with its button: Enter adds a line, ⌘/Ctrl + Enter saves, as in the app's
 * other long texts. `save` sends the text (the backend checks its length); on success the box
 * empties for the next note, or `onCancel` closes it when editing. */
export function NoteEditor({
  initial = "",
  submitLabel,
  busyLabel,
  save,
  onCancel,
  compact = false,
}: {
  initial?: string
  submitLabel: string
  busyLabel: string
  save: (text: string) => Promise<void>
  // Editing a note: a Cancel button, and the box gets the focus at once.
  onCancel?: () => void
  // One line until it's clicked, and again when left empty, growing and shrinking smoothly.
  compact?: boolean
}) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")
  const [text, setText] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [opened, setOpened] = useState(!compact)

  function focusAtEnd(box: HTMLTextAreaElement | null) {
    if (!box || document.activeElement === box) {
      return
    }

    box.focus()
    box.setSelectionRange(box.value.length, box.value.length)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()

    if (!text.trim() || busy) {
      return
    }

    setBusy(true)

    try {
      await save(text)
      setText("")

      if (compact) {
        ;(document.activeElement as HTMLElement | null)?.blur()
        setOpened(false)
      }
    } catch (error) {
      toast.error(
        serviceRefusal(error, [403, 404]) ??
          apiErrorMessage(error, t("noteFailed"))
      )
    } finally {
      setBusy(false)
    }
  }

  // What opens with the box fades in, kept in place so the box needs no other room.
  const fade = cn(
    "transition-opacity duration-200 motion-reduce:transition-none",
    !opened && "invisible opacity-0"
  )

  return (
    <form onSubmit={submit}>
      <FloatingTextarea
        label={t("noteLabel")}
        placeholder={t("notePlaceholder")}
        value={text}
        maxLength={MAX_NOTE_LENGTH}
        dir="auto"
        // Editing a note: focused at once, the cursor at the note's end, not its start.
        ref={onCancel ? focusAtEnd : undefined}
        data-testid={compact ? "note-box" : undefined}
        className={cn(
          "min-h-36 transition-[min-height,padding] duration-200 motion-reduce:transition-none",
          !opened && "min-h-14 pb-4"
        )}
        onFocus={() => setOpened(true)}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => compact && !text.trim() && setOpened(false)}
        onKeyDown={(event) => {
          if (isSubmitShortcut(event)) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }

          if (event.key === "Escape" && onCancel) {
            onCancel()
          }
        }}
        hint={
          <span className={fade}>
            <SubmitHint />
          </span>
        }
        action={
          <div className={cn("flex items-center gap-2", fade)}>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                className="h-10 shrink-0 rounded-lg px-5 text-base"
                disabled={busy}
                onClick={onCancel}
              >
                {common("cancel")}
              </Button>
            )}
            <Button
              type="submit"
              className="h-10 shrink-0 rounded-lg px-5 text-base"
              disabled={busy || !text.trim()}
            >
              {busy ? busyLabel : submitLabel}
            </Button>
          </div>
        }
      />
    </form>
  )
}
