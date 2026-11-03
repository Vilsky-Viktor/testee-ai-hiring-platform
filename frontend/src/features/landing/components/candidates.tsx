import { MicIcon, MousePointerClickIcon } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { CandidatesDemo } from "@/features/landing/components/candidates-demo"
import { DEMO_GROUP } from "@/features/landing/components/demo-panel"
import { NotesLine } from "@/features/landing/components/notes-line"
import { LandingSection } from "@/features/landing/components/section"
import { PhoneSteps } from "@/features/landing/components/phone-steps"
import { CANDIDATE_NOTES, CLICK_QUESTIONS } from "@/config/candidates-demo"
import { codeTokens, editorText } from "@/lib/code-tokens"
import { formatLanguages } from "@/lib/format"
import { publicFetch } from "@/lib/server-api"

// What the section shows, as cards on phones, each with its icon.
const PHONE_STEPS = {
  click: MousePointerClickIcon,
  voice: MicIcon,
}
const PHONE_KEYS = Object.keys(PHONE_STEPS) as (keyof typeof PHONE_STEPS)[]

/** What candidates see: an interview started and a question answered, in click mode and in
 * voice mode, played in one panel; under it, the languages voice mode speaks (left out when
 * generation doesn't answer) and what makes it easy and fair for them. */
export async function CandidatesSection() {
  const t = await getTranslations("landing.candidates")
  const locale = await getLocale()
  // The examples' colors, made here so the page doesn't load shiki for them.
  const [exampleColors, voiceLanguages] = await Promise.all([
    Promise.all(
      CLICK_QUESTIONS.map((question) =>
        question.example
          ? codeTokens(
              editorText(question.example.code),
              question.example.language
            )
          : null
      )
    ),
    publicFetch<string[]>("/generate/languages/voice"),
  ])

  return (
    <LandingSection id="candidates" title={t("title")} text={t("text")}>
      {/* More room under the text: the mode switch stands above the picture's edge. */}
      <div className="mt-8 flex flex-col gap-8 max-sm:mt-0">
        <div className={`${DEMO_GROUP} max-sm:hidden`}>
          <CandidatesDemo exampleColors={exampleColors} />
        </div>
        <PhoneSteps
          steps={PHONE_KEYS.map((key) => ({
            key,
            icon: PHONE_STEPS[key],
            title: t(`phone.${key}.title`),
            text: t(`phone.${key}.text`),
          }))}
        />
        {voiceLanguages?.length ? (
          <p className="flex items-center justify-center gap-2 text-center text-sm text-balance text-muted-foreground">
            <MicIcon aria-hidden className="size-4 shrink-0" />
            {t("voiceLanguages", {
              languages: formatLanguages(voiceLanguages, locale),
            })}
          </p>
        ) : null}
        <NotesLine notes={CANDIDATE_NOTES.map((key) => t(`notes.${key}`))} />
      </div>
    </LandingSection>
  )
}
