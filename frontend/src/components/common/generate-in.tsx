"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { LanguagePicker } from "@/components/common/language-picker"
import type { Locale } from "@/config/i18n"
import { apiFetch } from "@/lib/api"
import { isLocale } from "@/lib/locale"

/** Which language to generate a kit or interview in, among those the backend supports, the ones
 * voice mode speaks marked with a microphone. The form starts it on the interface's language. */
export function GenerateIn({
  value,
  onChange,
}: {
  value: Locale
  onChange: (language: Locale) => void
}) {
  const t = useTranslations("generateIn")
  const [languages, setLanguages] = useState<Locale[]>([])
  const [voice, setVoice] = useState<string[]>([])

  useEffect(() => {
    apiFetch<string[]>("/generate/languages")
      .then((codes) => setLanguages(codes.filter(isLocale)))
      .catch(() => {})
    // Only a mark: the choice works without it.
    apiFetch<string[]>("/generate/languages/voice")
      .then(setVoice)
      .catch(() => {})
  }, [])

  if (languages.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {/* The picker carries the same name, so the narrowest phones can drop it for room. */}
      <span className="shrink-0 max-[359px]:hidden">{t("label")}</span>
      <LanguagePicker
        languages={languages}
        value={value}
        onChange={onChange}
        label={t("label")}
        compact
        voice={voice}
      />
    </div>
  )
}
