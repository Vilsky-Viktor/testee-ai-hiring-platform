import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { SAVED_MARK_MS } from "@/config/lists"

/** For a setting that saves itself (components/common/saved-check.tsx): `markSaved(key)` once
 * it's saved, and `savedText(key)`, the check's text for that SAVED_MARK_MS, null otherwise. A
 * lone setting needs no key. */
export function useSavedMark<Key = true>() {
  const common = useTranslations("common")
  const [saved, setSaved] = useState<Key | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function markSaved(key: Key = true as Key) {
    setSaved(key)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSaved(null), SAVED_MARK_MS)
  }

  function savedText(key: Key = true as Key) {
    return saved === key ? common("saved") : null
  }

  return { markSaved, savedText }
}
