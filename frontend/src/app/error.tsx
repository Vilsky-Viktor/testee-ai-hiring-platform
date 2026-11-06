"use client"

import * as Sentry from "@sentry/nextjs"
import { TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { ReportProblem } from "@/components/common/report-problem"
import { Button } from "@/components/ui/button"
import { WARNING_TONE } from "@/config/tones"

/** A page that failed: what happened, Retry (the whole page loaded again, as a reload) and the way
 * home, a way to report it, and the failure's reference when the server gave one; the error goes to Sentry. global-error.tsx shows it too, when the
 * root layout itself failed. */
export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string }
  // Next.js's own retry: not used, as it keeps the browser's state that may have failed.
  reset: () => void
}) {
  const t = useTranslations("errors")
  const common = useTranslations("common")

  // A real reload: a failure in the browser's own code or state comes back otherwise.
  function retry() {
    window.location.reload()
  }

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <main
      data-testid="error-page"
      className="mx-auto flex w-full max-w-page flex-1 flex-col items-center justify-center px-6 py-12"
    >
      <div className="flex w-full flex-col items-center gap-8 text-center">
        <TriangleAlertIcon
          aria-hidden
          strokeWidth={1.5}
          className={`size-24 ${WARNING_TONE}`}
        />
        <div className="space-y-3">
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-md text-base text-balance text-muted-foreground">
            {t("text")}
          </p>
        </div>
        {/* Report beside the two; on phones on its own line under them. */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button className="h-12 px-6 text-base" onClick={retry}>
            {common("retry")}
          </Button>
          <Button
            variant="outline"
            className="h-12 px-6 text-base"
            render={<Link href="/" />}
            nativeButton={false}
          >
            {common("home")}
          </Button>
          <div className="flex justify-center max-sm:basis-full">
            <ReportProblem />
          </div>
        </div>
        {/* The server's reference for this failure, to quote when writing to testee. */}
        {error.digest && (
          <p className="text-xs text-muted-foreground" data-testid="error-ref">
            {t("reference", { id: error.digest })}
          </p>
        )}
      </div>
    </main>
  )
}
