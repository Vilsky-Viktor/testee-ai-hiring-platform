"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { SESSION_TIMEOUT_MS } from "@/config/api"
import { useAuth } from "@/providers/auth-provider"
import { ApiError, apiErrorMessage, apiFetch } from "@/lib/api"
import type { InterviewStep, SessionAnswerResult } from "@/types/company"
import type { AnswerInput } from "@/types/round"

/** A call to the interview's session; a stalled one fails like any other. */
function sessionPost<T>(path: string, body?: string) {
  return apiFetch<T>(`/rounds/sessions/${path}`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(SESSION_TIMEOUT_MS),
  })
}

/** A candidate's interview: the server says which section and question come next and when the
interview is done; this shows them, sends answers and asks for the next step. */
export function useSessionPlayer(id: string) {
  const t = useTranslations("session")
  const rounds = useTranslations("rounds")
  const { user } = useAuth()
  const uid = user?.uid
  const [step, setStep] = useState<InterviewStep | null>(null)
  const [missing, setMissing] = useState(false)
  // Opening the interview failed; `attempt` counts the tries, so "Try again" opens it anew.
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [finishing, setFinishing] = useState(false)
  // The question on screen, so a late answer response for an earlier one is ignored.
  const shownQuestion = useRef<string | null>(null)
  // One move to the next step at a time.
  const moving = useRef(false)

  function show(next: InterviewStep) {
    shownQuestion.current = next.question?.question_id ?? null
    setStep(next)
  }

  useEffect(() => {
    if (!uid) {
      return
    }

    let current = true
    sessionPost<InterviewStep>(`${id}/step`)
      .then((next) => {
        if (current) {
          shownQuestion.current = next.question?.question_id ?? null
          setStep(next)
        }
      })
      .catch((error) => {
        if (!current) {
          return
        }

        if (error instanceof ApiError && error.status === 404) {
          setMissing(true)

          return
        }

        setFailed(true)
      })

    return () => {
      current = false
    }
  }, [uid, id, attempt])

  function retry() {
    setFailed(false)
    setAttempt((count) => count + 1)
  }

  async function advance() {
    if (!step || moving.current) {
      return
    }

    moving.current = true

    try {
      show(await sessionPost<InterviewStep>(`${step.session.id}/step`))
    } catch {
      toast.error(t("continueFailed"))
    } finally {
      moving.current = false
    }
  }

  async function answer(input: AnswerInput) {
    const asked = step?.question?.question_id

    if (!step || !asked) {
      return false
    }

    try {
      const next = await sessionPost<SessionAnswerResult>(
        `${step.session.id}/answers`,
        JSON.stringify({ question_id: asked, ...input })
      )

      // The screen moved on meanwhile (time ran out): this answer's counts are old news.
      if (shownQuestion.current !== asked) {
        return true
      }

      setStep(
        (current) =>
          current && {
            ...current,
            session: { ...current.session, answered: next.answered },
            topics: current.topics.map((topic) =>
              topic.id === current.session.id
                ? { ...topic, answered: next.answered }
                : topic
            ),
          }
      )

      return true
    } catch (error) {
      toast.error(apiErrorMessage(error, rounds("submitFailed")))

      // Refused because the question's time ran out: the next one opens.
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        shownQuestion.current === asked
      ) {
        await advance()
      }

      return false
    }
  }

  async function finishInterview() {
    if (!step || finishing) {
      return
    }

    setFinishing(true)

    try {
      show(
        await sessionPost<InterviewStep>(`${step.session.id}/finish-interview`)
      )
    } catch {
      toast.error(t("finishFailed"))
      setFinishing(false)
    }
  }

  return {
    session: step?.session ?? null,
    question: step?.question ?? null,
    topics: step?.topics ?? [],
    minutesTaken: step?.minutes_taken,
    done: step?.done ?? false,
    missing,
    failed,
    retry,
    finishing,
    answer,
    advance,
    finishInterview,
  }
}
