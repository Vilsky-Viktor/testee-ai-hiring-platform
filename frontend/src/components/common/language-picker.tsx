"use client"

import { MicIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { SearchPicker } from "@/components/common/search-picker"
import { LANGUAGE_NAMES, type Locale } from "@/config/i18n"

/** A dropdown of languages with a search field, each named in its own language. `compact` is
 * the small trigger that sits next to a text box's send button; the languages in `voice` carry
 * a microphone, as voice mode speaks them. */
export function LanguagePicker({
  languages,
  value,
  onChange,
  label,
  disabled = false,
  compact = false,
  voice = [],
}: {
  languages: readonly Locale[]
  value: Locale
  onChange: (language: Locale) => void
  label: string
  disabled?: boolean
  compact?: boolean
  voice?: readonly string[]
}) {
  const t = useTranslations("settings")
  const tVoice = useTranslations("generateIn")

  return (
    <SearchPicker
      items={languages}
      value={value}
      onChange={onChange}
      labelOf={(language) => LANGUAGE_NAMES[language]}
      langOf={(language) => language}
      label={label}
      placeholder={t("searchLanguage")}
      empty={t("noLanguage")}
      disabled={disabled}
      compact={compact}
      markOf={(language) =>
        voice.includes(language) && (
          <>
            <MicIcon aria-hidden className="size-4 text-muted-foreground" />
            <span className="sr-only">{tVoice("voice")}</span>
          </>
        )
      }
    />
  )
}
