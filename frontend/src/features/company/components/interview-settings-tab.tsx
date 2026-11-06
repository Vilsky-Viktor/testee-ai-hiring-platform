import { getTranslations } from "next-intl/server"

import { SettingsGroup } from "@/features/company/components/setting-rows"
import { InterviewSettings } from "@/features/company/components/interview-settings"
import { ShareLink } from "@/features/company/components/share-link"
import type { InterviewDetail } from "@/types/company"

/** An interview's settings tab: the shareable link, then the interview's settings. */
export async function InterviewSettingsTab({
  interview,
  canEdit,
}: {
  interview: InterviewDetail
  canEdit: boolean
}) {
  const t = await getTranslations("interviews")

  return (
    <div className="space-y-8">
      <SettingsGroup title={t("settingsSharing")}>
        <ShareLink
          interviewId={interview.id}
          linkToken={interview.link_token}
          canEdit={canEdit}
        />
      </SettingsGroup>
      <InterviewSettings
        interviewId={interview.id}
        questionSeconds={interview.question_seconds}
        passMark={interview.pass_mark}
        hired={interview.hired}
        keepPrivate={interview.keep_private}
        voice={interview.voice ?? false}
      />
    </div>
  )
}
