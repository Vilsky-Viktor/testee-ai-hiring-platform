"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useLocale } from "next-intl"
import { useState } from "react"

import { GenerateIn } from "@/components/common/generate-in"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Locale } from "@/config/i18n"
import { MAX_GOAL_LENGTH } from "@/config/limits"
import { useOneAtATime } from "@/hooks/use-one-at-a-time"
import { isSubmitShortcut } from "@/lib/keys"

/** The box a test starts from, as on the home page: the pasted description, the language to
 * generate in, and the button. `onSubmit` returns once the page moves on, or after an error,
 * which re-enables the box. `disabled` turns the text and the button off, e.g. while paused.
 * `example` fills an empty box with a sample description. */
export function DescriptionBox({
  placeholder,
  label,
  submitLabel,
  onSubmit,
  disabled = false,
  initialText = "",
  example,
}: {
  placeholder: string
  label: string
  submitLabel: string
  onSubmit: (text: string, generateIn: Locale) => Promise<void>
  disabled?: boolean
  // Text to start from, which the user can edit (an ATS job's description).
  initialText?: string
  example?: { label: string; text: string }
}) {
  const [text, setText] = useState(initialText)
  // Starts on the interface's language; any supported one can be chosen.
  const [generateIn, setGenerateIn] = useState(useLocale() as Locale)
  const [busy, setBusy] = useState(false)
  const once = useOneAtATime()

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    await once(async () => {
      setBusy(true)
      await onSubmit(text.trim(), generateIn)
      setBusy(false)
    })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (isSubmitShortcut(event)) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form
      onSubmit={submit}
      className="relative w-full rounded-xl border border-transparent bg-background bg-[linear-gradient(var(--surface),var(--surface))] p-3 transition-colors focus-within:border-ring-gradient"
    >
      <Textarea
        maxLength={MAX_GOAL_LENGTH}
        required
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={label}
        disabled={disabled}
        className="max-h-72 min-h-40 resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0 md:text-base dark:bg-transparent"
        autoFocus
      />
      {/* The language, then the button at the end; on phones the button takes its own line. */}
      <div className="flex flex-wrap items-center justify-end gap-3 ps-2 pt-2">
        {example && !text && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ms-2 me-auto text-muted-foreground"
            data-testid="try-example"
            onClick={() => setText(example.text)}
          >
            {example.label}
          </Button>
        )}
        <GenerateIn value={generateIn} onChange={setGenerateIn} />
        <Button
          type="submit"
          className="h-10 px-5 text-base max-sm:w-full"
          disabled={disabled || busy || !text.trim()}
        >
          {busy && <LoaderCircleIcon className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
