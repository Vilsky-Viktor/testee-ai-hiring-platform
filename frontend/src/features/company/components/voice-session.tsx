import { cn } from "cn"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { MultiChoiceTag } from "@/components/common/multi-choice-tag"
import { QuestionText } from "@/components/common/question-text"
import { QuestionCode } from "@/features/company/components/question-code"
import { RoundFooter } from "@/components/common/round-footer"
import { Button } from "@/components/ui/button"
import { CARD_PADDING } from "@/config/cards"
import { ChoiceOptions } from "@/features/company/components/choice-options"
import { FinishDialog } from "@/features/company/components/session-finish"
import { SessionTop } from "@/features/company/components/session-header"
import type { SessionPlayProps } from "@/features/company/components/session-play"
import { VoiceStatusCard } from "@/features/company/components/voice-status"
import { useIntegritySignals } from "@/hooks/use-integrity-signals"
import {
  useQuestionFocus,
  useSessionAnswers,
} from "@/hooks/use-session-answers"
import { useVoiceInterviewer } from "@/hooks/use-voice-interviewer"
import { useVoiceWaves } from "@/hooks/use-voice-waves"
import { formatList } from "@/lib/format"
import { languageOf } from "@/lib/locale"
import { proseAndCode } from "@/lib/question-text"
import type { VoiceAnnouncement } from "@/types/round"

/** What she understood of the open question's answer, by its letters; nothing yet otherwise. */
function heardLetters(
  heard: { question: string; options: number[] } | null,
  questionId: string | undefined,
  locale: string
) {
  if (heard?.question !== questionId || !heard?.options.length) {
    return null
  }

  return formatList(
    heard.options.map((option) => String.fromCharCode(65 + option)),
    locale
  )
}

/** A voice interview's screen: the session's header on top; on one side the status card (Mira, the
 * AI interviewer, one wave, what's happening and the answer she heard); on the other the question she reads and its options as the same cards as in click mode; at the
 * bottom only End (and Next once an option is tapped, for anyone answering without their
 * voice). She starts speaking as it
 * opens: the start page allowed the microphone and sound. */
export function VoiceSession({
  session,
  progress,
  section,
  question,
  onAnswer,
  onAdvance,
  onFinish,
  finishing,
  back,
  brand,
}: SessionPlayProps) {
  const t = useTranslations("session")
  const rounds = useTranslations("rounds")
  const locale = useLocale()
  const [confirmFinish, setConfirmFinish] = useState(false)
  // The question whose clock ran out, announced to screen readers; the screen moves on quietly.
  const [timedOut, setTimedOut] = useState<string | null>(null)
  const [heard, setHeard] = useState<{
    question: string
    options: number[]
  } | null>(null)
  useIntegritySignals(session.id, session.status === "in_progress")
  const questionId = question?.question_id
  const multi = Boolean(question?.multi)
  const { chosen, sending, answered, allAnswered, sendThen, choose, setPick } =
    useSessionAnswers(questionId, multi, progress, onAnswer)
  const questionRef = useQuestionFocus(questionId)
  const { prose, code } = proseAndCode(question?.text ?? "")
  // Once the answer is saved, Mira says she's moving on (not after the interview's last
  // question), and only then is the next question asked for: its clock starts as it opens.
  const moveOn = async (said: VoiceAnnouncement) => {
    if (!question?.last) {
      await voice.announce(said)
    }

    await onAdvance()
  }
  const sendAndAdvance = () => sendThen(() => moveOn("next"))
  // A clear spoken answer is saved at once: Mira says so ("B, saved.", the last question's too),
  // then the next question opens without "Moving on".
  const saveAndAdvance = (picks: number[]) => {
    setHeard({ question: questionId ?? "", options: picks })

    return sendThen(
      async () => {
        await voice.announceSaved(picks)
        await onAdvance()
      },
      false,
      picks
    )
  }
  // Spoken answers pick options as taps do, and a spoken yes sends them as Next does.
  // Mira's "{letter}, saved." is said only on a single-answer question.
  const letters = multi ? 0 : (question?.options.length ?? 0)
  const voice = useVoiceInterviewer(session.id, questionId, chosen, letters, {
    onPick: (question, options) => {
      setPick({ question, options })
      setHeard({ question, options })
    },
    onConfirm: sendAndAdvance,
    onSave: saveAndAdvance,
    failedMessage: t("voiceFailed"),
  })
  // The candidate's wave stays flat while Mira speaks: the microphone hears her from the speakers
  // too, and it isn't listening then.
  const waves = useVoiceWaves(voice.meter, voice.status === "speaking")
  const heardNow = heardLetters(heard, questionId, locale)

  // Mira starts as the screen opens.
  useEffect(() => {
    void voice.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8 pb-28">
      <SessionTop
        back={back}
        timedOut={timedOut}
        brand={brand}
        session={session}
        progress={progress}
        section={section}
        question={question}
        sending={sending}
        onTimeUp={() => {
          setTimedOut(question?.question_id ?? null)
          // The question's time is over even if its pick can't be saved: the next opens. An
          // answer spoken in time is waited for, and what it picked shows on the options and is
          // saved without asking; Mira names it as she does a clear answer ("B and D, saved."),
          // or says whether a tapped answer was saved.
          void voice.timeUp().then((picks) => {
            if (picks) {
              setPick({ question: questionId ?? "", options: picks })
            }

            return sendThen(
              async (saved) => {
                if (saved && picks?.length) {
                  await voice.announceSaved(picks)
                  await onAdvance()

                  return
                }

                await moveOn(saved ? "time-up-saved" : "time-up")
              },
              true,
              picks ?? undefined
            )
          })
        }}
      />
      {/* Two parts, 30% and 70%, stacked below that: the one status card, then the question and
          its options. */}
      <div className="grid grid-cols-1 gap-6 max-sm:gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
        <VoiceStatusCard
          miraRef={waves.mira}
          youRef={waves.you}
          status={voice.status}
          picked={chosen.length > 0}
          heard={heardNow}
          problem={voice.problem}
          onSoundOn={() => void voice.start()}
        />
        {question && (
          // The question and the options in the interview's own language, so screen readers read
          // them with the right voice; the tag is the site's.
          <div
            key={question.question_id}
            ref={questionRef}
            {...languageOf(session.language)}
            className="flex w-full flex-col gap-6 motion-safe:animate-[question-in_0.2s_ease-out]"
          >
            {/* The question in its grey card, as in click mode; its code examples under it. */}
            <div
              data-testid="question-box"
              className={cn(
                "space-y-3 rounded-xl bg-surface max-sm:-mx-6 max-sm:rounded-none",
                CARD_PADDING
              )}
            >
              {multi && (
                <div {...languageOf(locale)}>
                  <MultiChoiceTag />
                </div>
              )}
              <QuestionText
                heading
                text={prose}
                className="text-2xl leading-snug font-normal max-sm:text-xl"
              />
            </div>
            {code && <QuestionCode code={code} />}
            {/* The same option cards as in click mode. */}
            <ChoiceOptions
              options={question.options}
              chosen={chosen}
              multi={multi}
              disabled={sending}
              bleed
              onChoose={(option) => choose(question.question_id, option)}
            />
          </div>
        )}
      </div>
      <RoundFooter>
        <Button
          variant="ghost"
          className="h-12 shrink-0 px-6 text-base text-muted-foreground max-sm:px-3"
          disabled={finishing || sending}
          onClick={() => setConfirmFinish(true)}
          data-testid="finish-interview"
        >
          {finishing ? rounds("finishing") : t("voiceEnd")}
        </Button>
        <div className="flex items-center gap-3 max-sm:flex-1">
          {chosen.length > 0 && (
            <Button
              className="h-12 px-8 text-base max-sm:w-full"
              disabled={sending}
              onClick={sendAndAdvance}
              data-testid="next-question"
            >
              {rounds("next")}
            </Button>
          )}
        </div>
      </RoundFooter>
      <FinishDialog
        open={confirmFinish}
        finishing={finishing}
        sections={section.count}
        unanswered={allAnswered ? null : progress.total - answered}
        onClose={() => setConfirmFinish(false)}
        // The pick on screen is saved first, so it counts; finishing goes ahead even when it
        // can't be saved.
        onFinish={() => sendThen(onFinish, true)}
      />
    </div>
  )
}
