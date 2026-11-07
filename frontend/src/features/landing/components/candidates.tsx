import { MicIcon, MousePointerClickIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { LocalizedLink } from "@/components/common/localized-link"
import { CandidatesDemo } from "@/features/landing/components/candidates-demo"
import { DemoFit } from "@/features/landing/components/demo-fit"
import { DEMO_GROUP } from "@/features/landing/components/demo-panel"
import { LandingSection } from "@/features/landing/components/section"
import { PhoneSteps } from "@/features/landing/components/phone-steps"
import {
  TrustCards,
  TrustCardText,
} from "@/features/landing/components/trust-cards"
import { CANDIDATE_CARDS, CLICK_QUESTIONS } from "@/config/candidates-demo"
import { codeTokens, editorText } from "@/lib/code-tokens"
import { TEXT_LINK } from "@/config/links"
import { VOICE_GUIDE_PATH } from "@/config/voice"

// What the section shows, as cards on phones, each with its icon.
const PHONE_STEPS = {
  click: MousePointerClickIcon,
  voice: MicIcon,
}
const PHONE_KEYS = Object.keys(PHONE_STEPS) as (keyof typeof PHONE_STEPS)[]

/** What candidates see: an interview started and a question answered, in click mode and in
 * voice mode, played in one panel; under it, that voice mode's quality differs by language (with
 * the guide that measures it) and what makes it easy and fair for them. */
export async function CandidatesSection() {
  const t = await getTranslations("landing.candidates")
  // The examples' colors, made here so the page doesn't load shiki for them.
  const exampleColors = await Promise.all(
    CLICK_QUESTIONS.map((question) =>
      question.example
        ? codeTokens(
            editorText(question.example.code),
            question.example.language
          )
        : null
    )
  )

  return (
    <LandingSection id="candidates" title={t("title")} text={t("text")}>
      {/* More room under the text: the mode switch stands above the picture's edge. */}
      <div className="mt-8 flex flex-col gap-8 max-sm:mt-0">
        <div className={`${DEMO_GROUP} max-sm:hidden`}>
          <DemoFit>
            <CandidatesDemo exampleColors={exampleColors} />
          </DemoFit>
        </div>
        <PhoneSteps
          steps={PHONE_KEYS.map((key) => ({
            key,
            icon: PHONE_STEPS[key],
            title: t(`phone.${key}.title`),
            text: t(`phone.${key}.text`),
          }))}
        />
        <p className="flex items-center justify-center gap-2 text-center text-sm text-balance text-muted-foreground">
          <MicIcon aria-hidden className="size-4 shrink-0" />
          <span>
            {t.rich("voiceQuality", {
              link: (chunks) => (
                <LocalizedLink href={VOICE_GUIDE_PATH} className={TEXT_LINK}>
                  {chunks}
                </LocalizedLink>
              ),
            })}
          </span>
        </p>
        {/* A promo: its columns pop in as they come into view (promo.css). */}
        <div data-promo>
          <TrustCards
            cards={CANDIDATE_CARDS.map((key) => ({
              key,
              content: (
                <TrustCardText title={t(`cards.${key}.title`)}>
                  {t(`cards.${key}.text`)}
                </TrustCardText>
              ),
            }))}
          />
        </div>
      </div>
    </LandingSection>
  )
}
