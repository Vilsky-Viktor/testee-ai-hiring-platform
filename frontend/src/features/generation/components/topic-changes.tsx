"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { SubmitHint } from "@/components/common/submit-hint"
import { Button } from "@/components/ui/button"
import { FloatingTextarea } from "@/components/ui/floating-field"
import { MAX_INSTRUCTIONS_LENGTH } from "@/config/limits"
import { isSubmitShortcut } from "@/lib/keys"

/** The box asking the AI to change the drafted topics: one line until it's used, then with its
 * shortcut; Apply always there, off until there's something to apply. */
export function TopicChanges({
  value,
  onChange,
  disabled,
  onApply,
}: {
  value: string
  onChange: (value: string) => void
  disabled: boolean
  onApply: () => void
}) {
  const t = useTranslations("generation")
  const [focused, setFocused] = useState(false)
  const opened = focused || value.trim().length > 0
  // What opens with the box fades in, kept in place so the box needs no other room.
  const fade = cn(
    "transition-opacity duration-200 motion-reduce:transition-none",
    !opened && "invisible opacity-0"
  )

  return (
    <FloatingTextarea
      label={t("changes")}
      placeholder={t("changesPlaceholder")}
      maxLength={MAX_INSTRUCTIONS_LENGTH}
      value={value}
      dir="auto"
      className={cn(
        "min-h-32 transition-[min-height,padding] duration-200 motion-reduce:transition-none",
        !opened && "min-h-14 pb-4"
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (isSubmitShortcut(event) && !disabled) {
          event.preventDefault()
          onApply()
        }
      }}
      hint={
        <span className={fade}>
          <SubmitHint />
        </span>
      }
      action={
        <Button
          type="button"
          className="h-10 px-5 text-base"
          disabled={disabled}
          onClick={onApply}
        >
          {t("apply")}
        </Button>
      }
    />
  )
}
