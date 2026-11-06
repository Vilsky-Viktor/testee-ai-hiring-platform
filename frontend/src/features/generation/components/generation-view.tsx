"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useAuth } from "@/providers/auth-provider"
import { BackLink } from "@/components/common/back-link"
import { CancelGeneration } from "@/components/common/cancel-generation"
import {
  Message,
  WithBack,
} from "@/features/generation/components/generation-message"
import { GenerationProgress } from "@/components/common/generation-progress"
import { TopicReview } from "@/features/generation/components/topic-review"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { useGenerationPoll } from "@/hooks/use-generation-poll"
import { useMadeFrom } from "@/hooks/use-draft"
import { useHumanCheck } from "@/hooks/use-human-check"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { humanHeaders } from "@/lib/human-check"
import { topUpAction } from "@/lib/credits"
import type { DraftTopic, Generation } from "@/types/generation"

export function GenerationView({
  path,
  next,
  backHref,
  backLabel,
  leaveLabel,
  company,
}: {
  path: string
  // Where to go once the test is ready.
  next: string
  backHref: string
  backLabel: string
  // The button away from the questions being written; none without it.
  leaveLabel?: string
  company?: string
}) {
  const t = useTranslations("generation")
  useHumanCheck()
  const billing = useTranslations("billing")
  const common = useTranslations("common")
  const { user, loading } = useAuth()
  const router = useRouter()
  const [generation, setGeneration] = useState<Generation | null>(null)
  const job = useMadeFrom(generation?.id)
  const status = generation?.status
  const [missing, setMissing] = useState(false)
  // Bumped after a review so polling starts again.
  const [round, setRound] = useState(0)

  useGenerationPoll<Generation>(user ? path : null, round, setGeneration, () =>
    setMissing(true)
  )

  useEffect(() => {
    if (status === "done") {
      router.replace(next)
    }
  }, [status, next, router])

  async function submitReview(
    selected: number[],
    instructions: string,
    topics: DraftTopic[] | null
  ) {
    try {
      // A company that never paid shows it's a person before its questions are made.
      const next = await apiFetch<Generation>(`${path}/review`, {
        method: "POST",
        body: JSON.stringify({ selected, instructions, topics }),
        headers: await humanHeaders(),
      })
      setGeneration(next)
      setRound((value) => value + 1)
    } catch (error) {
      // Without enough credits the draft waits; the toast offers the top-up page.
      toast.error(
        apiErrorMessage(error, t("reviewFailed")),
        topUpAction(error, billing("topUp"), () => router.push("/top-up"))
      )
    }
  }

  async function retry() {
    try {
      const next = await apiFetch<Generation>(`${path}/retry`, {
        method: "POST",
      })
      setGeneration(next)
      setRound((value) => value + 1)
    } catch (error) {
      toast.error(
        apiErrorMessage(error, t("retryFailed")),
        topUpAction(error, billing("topUp"), () => router.push("/top-up"))
      )
    }
  }

  if (!loading && !user) {
    return (
      <WithBack href={backHref} label={backLabel}>
        <SignInPrompt />
      </WithBack>
    )
  }

  if (missing) {
    return (
      <WithBack href={backHref} label={backLabel}>
        <Message back={backHref} text={t("missing")} />
      </WithBack>
    )
  }

  if (status === "cancelled") {
    return (
      <WithBack href={backHref} label={backLabel}>
        <Message back={backHref} text={t("cancelled")} />
      </WithBack>
    )
  }

  const cancel = <CancelGeneration path={path} leaveTo={backHref} />

  if (status === "failed") {
    return (
      <WithBack href={backHref} label={backLabel}>
        <Message back={backHref} text={t("failed")} onRetry={retry} />
        {cancel && <div className="flex justify-center">{cancel}</div>}
      </WithBack>
    )
  }

  if (generation?.status === "awaiting_review" && generation.topics) {
    return (
      <TopicReview
        key={round}
        topics={generation.topics}
        maxTopics={generation.max_topics}
        maxSubtopics={generation.max_subtopics}
        minAddedSubtopics={generation.min_added_subtopics}
        back={
          <BackLink href={backHref} help="reviewTopics">
            {backLabel}
          </BackLink>
        }
        cancel={
          <CancelGeneration
            path={path}
            leaveTo={backHref}
            label={common("cancel")}
          />
        }
        onSubmit={submitReview}
      />
    )
  }

  if (status === "done") {
    return null
  }

  return (
    <GenerationProgress
      generation={generation}
      backHref={backHref}
      backLabel={backLabel}
      leaveLabel={leaveLabel}
      company={company}
      job={job}
      action={generation && cancel}
    />
  )
}
