import {
  BadgeCheckIcon,
  ClipboardPasteIcon,
  ListChecksIcon,
  MailIcon,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

import { CreateFlow } from "@/features/landing/components/create-flow"
import { DemoFit } from "@/features/landing/components/demo-fit"
import { DEMO_GROUP } from "@/features/landing/components/demo-panel"
import { NotesLine } from "@/features/landing/components/notes-line"
import { PhoneSteps } from "@/features/landing/components/phone-steps"
import { LandingSection } from "@/features/landing/components/section"
import { BAND } from "@/config/landing-backgrounds"

// The four steps, each with its icon on phones.
const STEPS = {
  describe: ClipboardPasteIcon,
  adjust: ListChecksIcon,
  ready: BadgeCheckIcon,
  invited: MailIcon,
}
const STEP_KEYS = Object.keys(STEPS) as (keyof typeof STEPS)[]

/** How an interview is created, played in one frame: a job description pasted and a first
 * company named, its topics adjusted, and the interview made from them, a candidate invited, who
 * gets the invitation by email.
 * Under it, short facts: that no subject expert is needed to make one, and the ready templates.
 * On phones, the three steps as cards in place of the frame. */
export async function CreateSection() {
  const t = await getTranslations("landing.create")

  return (
    <LandingSection
      id="how"
      title={t("title")}
      text={t("text")}
      background={BAND}
    >
      <div className="mt-8 flex flex-col gap-8 max-sm:mt-0">
        <div className={`${DEMO_GROUP} mx-auto w-full max-w-6xl max-sm:hidden`}>
          <DemoFit>
            <CreateFlow
              labels={{
                steps: STEP_KEYS.map((step) =>
                  t.rich(step, {
                    n: (chunks) => (
                      <span
                        className={`absolute inset-y-0 start-0 flex w-14 items-center justify-center bg-background ps-1 text-primary`}
                      >
                        {chunks}
                      </span>
                    ),
                  })
                ),
                status: t("status"),
              }}
            />
          </DemoFit>
        </div>
        <PhoneSteps
          className="bg-background"
          steps={STEP_KEYS.map((key) => ({
            key,
            icon: STEPS[key],
            title: t.markup(key, { n: (chunks) => chunks }),
            text: t(`phone.${key}`),
          }))}
        />
        <NotesLine notes={[t("notes.expert"), t("notes.templates")]} />
      </div>
    </LandingSection>
  )
}
