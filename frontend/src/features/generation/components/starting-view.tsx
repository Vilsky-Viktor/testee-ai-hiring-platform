"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useEffectEvent, useState } from "react"

import { useAuth } from "@/providers/auth-provider"
import { GenerationProgress } from "@/components/common/generation-progress"
import { Message } from "@/features/generation/components/generation-message"
import { useDraft } from "@/hooks/use-draft"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import {
  answered,
  clearPendingStart,
  clearStart,
  type PendingStart,
  readDraft,
  readPendingStart,
  saveMadeFrom,
  savePendingStart,
  stillRunning,
  whenDone,
} from "@/lib/pending-start"
import type { Interview } from "@/types/company"

/** The interview kept in the tab (lib/pending-start.ts) being made, its topics' generating page
 * shown meanwhile; made, its generation's page opens in its place. A reload makes the same one
 * again (its key), so nothing is made twice. Refused, the reason and a way to start over; cut
 * off, a retry. With none kept (made already, or another tab), back to the home page. */
export function StartingView({ companyName }: { companyName?: string }) {
  const t = useTranslations("start")
  const generation = useTranslations("generation")
  const draft = useDraft()
  const { user, loading } = useAuth()
  const router = useRouter()
  // The company chosen for it (app/generate/company).
  const company = useSearchParams().get("company")
  const [problem, setProblem] = useState<{ text: string; retry: boolean }>()

  function make(pending: PendingStart) {
    return whenDone(() =>
      apiFetch<Interview>(
        `/companies/interviews?company_id=${pending.companyId}`,
        {
          method: "POST",
          body: JSON.stringify({
            text: pending.text,
            generate_in: pending.generateIn,
          }),
          headers: { "Idempotency-Key": `${pending.key}:interview` },
        }
      )
    ).then(
      (interview) => {
        saveMadeFrom(interview.generation_id!, pending.text)
        clearStart()
        router.replace(
          `/generate/${interview.generation_id}?next=/companies/${pending.companyId}/interviews/${interview.id}`
        )
      },
      (error) => {
        if (answered(error)) {
          clearPendingStart()
        }

        setProblem({
          text:
            (!stillRunning(error) && serviceRefusal(error, [409])) ||
            apiErrorMessage(error, t("failed")),
          retry: !answered(error),
        })
      }
    )
  }

  // The start kept before a reload, else a new one for the description kept in the tab; with
  // neither (made already, or opened in another tab), back to the description box.
  const begin = useEffectEvent(() => {
    const kept = readPendingStart()
    const fresh = readDraft()
    const pending =
      kept?.companyId === company
        ? kept
        : company && fresh
          ? {
              key: crypto.randomUUID(),
              text: fresh.text,
              generateIn: fresh.generateIn,
              companyId: company,
            }
          : null

    if (pending) {
      savePendingStart(pending)
      void make(pending)
    } else {
      router.replace("/")
    }
  })

  // Once the user is known.
  useEffect(() => {
    if (!loading && user) {
      begin()
    }
  }, [loading, user])

  if (problem) {
    const pending = readPendingStart()

    return (
      <Message
        back="/"
        text={problem.text}
        onRetry={
          problem.retry && pending
            ? () => {
                setProblem(undefined)

                return make(pending)
              }
            : undefined
        }
      />
    )
  }

  return (
    <GenerationProgress
      generation={null}
      backHref={`/companies/${company}/interviews`}
      backLabel={generation("interviews")}
      company={companyName}
      job={draft?.text}
    />
  )
}
