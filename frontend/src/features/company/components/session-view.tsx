"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { useAuth } from "@/providers/auth-provider"
import { BackLink } from "@/components/common/back-link"
import { CandidateFinished } from "@/components/common/candidate-finished"
import { CompanyLogo } from "@/components/common/company-logo"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import {
  SessionPlay,
  type SessionPlayProps,
} from "@/features/company/components/session-play"
import { VoiceSession } from "@/features/company/components/voice-session"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { Button } from "@/components/ui/button"
import { useSessionPlayer } from "@/hooks/use-session-player"
import { useSessionBrand } from "@/hooks/use-session-brand"
import { useSessionDone } from "@/hooks/use-session-done"
import { bdi } from "@/lib/bidi"
import { setTimedPageOver } from "@/lib/timed-page"
import type { Brand } from "@/types/company"

/** The test a candidate takes; for a company member's preview, `testHref` is the test's page:
 * while playing, the back arrow goes to its interview list, and once finished, a button does. */
export function SessionView({
  id,
  testHref,
  onFinished,
}: {
  id: string
  testHref?: string
  // Embedded in a company's site: told once it's finished, which takes the candidate on.
  onFinished?: (candidateId: string) => void
}) {
  const interviews = useTranslations("interviews")
  const common = useTranslations("common")
  const back = testHref && (
    <BackLink
      href={testHref.slice(0, testHref.lastIndexOf("/"))}
      className="max-sm:mb-0"
    >
      {interviews("title")}
    </BackLink>
  )
  const { user, loading } = useAuth()
  const {
    session,
    question,
    topics,
    done,
    missing,
    failed,
    retry,
    minutesTaken,
    finishing,
    answer,
    advance,
    finishInterview,
  } = useSessionPlayer(id)
  const inviteId = session?.candidate_invite_id
  const practice = Boolean(session?.practice)
  useSessionDone(done, inviteId, practice, onFinished)
  const brand = useSessionBrand(testHref, inviteId, practice)
  const signedOut = !loading && !user

  // The header and footer come back if no question was ever on the clock: signed out, not found,
  // failed. A company's interview stays without them once finished, showing the company only;
  // a practice round goes on to its results, which have them.
  const over = signedOut || missing || failed

  useEffect(() => {
    setTimedPageOver(over)

    return () => setTimedPageOver(false)
  }, [over])

  if (signedOut) {
    return <SignInPrompt />
  }

  if (missing || failed) {
    return <SessionProblem missing={missing} onRetry={retry} />
  }

  // Loading the session, or its next question: the site's AI loading mark, never a blank page.
  if (!session) {
    return <LoadingSpinner label={common("loading")} />
  }

  const progress = topics.reduce(
    (sum, topic) => ({
      answered: sum.answered + topic.answered,
      total: sum.total + topic.total,
    }),
    { answered: 0, total: 0 }
  )

  if (!question) {
    // A practice round goes on to its results instead.
    if (!done || session.practice) {
      return <LoadingSpinner label={common("loading")} />
    }

    return (
      <SessionFinished
        brand={brand}
        title={session.interview_title ?? session.topic_title}
        answered={{ done: progress.answered, total: progress.total }}
        minutes={minutesTaken}
        preview={Boolean(testHref)}
        embedded={Boolean(onFinished)}
        testHref={testHref}
      />
    )
  }

  const section = {
    number: topics.findIndex((topic) => topic.id === session.id) + 1,
    count: topics.length,
  }

  return (
    <SessionScreen
      session={session}
      progress={progress}
      section={section}
      question={question}
      onAnswer={answer}
      onAdvance={advance}
      onFinish={finishInterview}
      finishing={finishing}
      back={back}
      brand={
        <SessionLogo
          brand={brand}
          className="h-14 w-auto max-w-32 shrink-0 rounded-xl object-contain"
        />
      }
    />
  )
}

/** A voice interview's screen, Mira in the centre, or the screen whose options are tapped. */
function SessionScreen(props: SessionPlayProps) {
  return props.session.voice ? (
    <VoiceSession {...props} />
  ) : (
    <SessionPlay {...props} />
  )
}

/** A company's interview once finished, between the header and footer, which are back. Sent from
 * the company's own platform, a button back there; a member's preview, a button to the test. */
function SessionFinished({
  brand,
  title,
  answered,
  minutes,
  preview,
  embedded,
  testHref,
}: {
  brand: Brand | null
  title: string
  answered: { done: number; total: number }
  minutes?: number | null
  preview: boolean
  embedded: boolean
  testHref?: string
}) {
  const t = useTranslations("session")

  return (
    <CandidateFinished
      company={brand?.company}
      logoUrl={brand?.logo_url}
      title={title}
      answered={answered}
      minutes={minutes}
      preview={preview}
      action={
        embedded ? null : brand?.return_url ? (
          <Button
            className="h-12 px-6 text-base"
            render={<a href={brand.return_url} />}
            nativeButton={false}
          >
            {t.rich("backTo", { company: brand.company, ...bdi })}
          </Button>
        ) : (
          testHref && (
            <Button
              className="h-12 px-6 text-base"
              render={
                <Link href={testHref.slice(0, testHref.lastIndexOf("/"))} />
              }
              nativeButton={false}
            >
              {t("toTest")}
            </Button>
          )
        )
      }
    />
  )
}

function SessionLogo({
  brand,
  className,
}: {
  brand: Brand | null
  className: string
}) {
  if (!brand?.logo_url) {
    return null
  }

  return (
    <CompanyLogo
      url={brand.logo_url}
      name={brand.company}
      className={className}
    />
  )
}

/** A test that isn't there, or couldn't start (with a retry). */
function SessionProblem({
  missing,
  onRetry,
}: {
  missing: boolean
  onRetry: () => void
}) {
  const t = useTranslations("session")
  const common = useTranslations("common")

  if (missing) {
    return (
      <p className="py-24 text-center text-base text-muted-foreground">
        {t("missing")}
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <p className="text-base text-muted-foreground">{t("startFailed")}</p>
      <Button className="h-12 px-6 text-base" onClick={onRetry}>
        {common("retry")}
      </Button>
    </div>
  )
}
