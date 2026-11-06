import { useMessages } from "next-intl"
import { useMemo } from "react"

import type { DemoContent } from "@/features/landing/types/demo-content"
import { reportCandidates } from "@/config/reports-demo"

/** The texts the landing demo `name` shows, in the page's language (`landing.demoContent`). */
export function useDemoContent<Name extends keyof DemoContent>(
  name: Name
): DemoContent[Name] {
  return useMessages().landing.demoContent[name]
}

/** The "see who's best" demo's candidates, their topics and answers in the page's language. */
export function useReportCandidates() {
  const content = useDemoContent("reports")

  return useMemo(() => reportCandidates(content), [content])
}
