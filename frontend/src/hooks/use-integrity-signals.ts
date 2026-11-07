import { useEffect } from "react"

import { apiFetch } from "@/lib/api"

/** Tells the server when the candidate leaves the page or copies, for the company's scorecard,
and when they're back (the server drops a leave too short to count).

Reporting never gets in the candidate's way: a failed report is dropped. */
export function useIntegritySignals(sessionId: string, active: boolean) {
  useEffect(() => {
    if (!active) {
      return
    }

    let away = false

    function report(kind: "tab_leave" | "tab_return" | "copy") {
      apiFetch(`/rounds/sessions/${sessionId}/signals`, {
        method: "POST",
        body: JSON.stringify({ kind }),
      }).catch(() => {})
    }

    // Blur covers both another tab and another app.
    function onBlur() {
      away = true
      report("tab_leave")
    }

    function onFocus() {
      if (!away) {
        return
      }

      report("tab_return")
      away = false
    }

    const onCopy = () => report("copy")

    window.addEventListener("blur", onBlur)
    window.addEventListener("focus", onFocus)
    document.addEventListener("copy", onCopy)

    return () => {
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("copy", onCopy)
    }
  }, [sessionId, active])
}
