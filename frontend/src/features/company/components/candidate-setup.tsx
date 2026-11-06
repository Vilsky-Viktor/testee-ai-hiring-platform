import { getTranslations } from "next-intl/server"

import { LIST_BOX } from "@/config/lists"
import { CandidateMode } from "@/features/company/components/candidate-mode"
import { ExtraTime } from "@/features/company/components/extra-time"
import { InviteLinkCard } from "@/features/company/components/invite-link-card"
import type { Scorecard } from "@/types/company"

/** What can still change about a candidate: the invite link, how they take the interview and
 * their extra time, as the API offers them; nothing once none can. */
export async function CandidateSetup({
  card,
  interviewId,
  inviteId,
}: {
  card: Scorecard
  interviewId: string
  inviteId: string
}) {
  const t = await getTranslations("candidates")
  const options = card.extra_time_options

  if (!card.invite_token && !card.mode_editable && options.length === 0) {
    return null
  }

  return (
    <div className={LIST_BOX} data-testid="candidate-setup">
      <InviteLinkCard token={card.invite_token} />
      <CandidateMode
        interviewId={interviewId}
        inviteId={inviteId}
        voice={card.voice}
        editable={card.mode_editable}
      />
      {options.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-6">
          <span className="text-lg font-light">{t("extraTimeLabel")}</span>
          <ExtraTime
            interviewId={interviewId}
            inviteId={inviteId}
            current={card.extra_time}
            options={options}
          />
        </div>
      )}
    </div>
  )
}
