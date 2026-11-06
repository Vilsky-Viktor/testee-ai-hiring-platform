import { getTranslations } from "next-intl/server"

import { CopyField } from "@/components/common/copy-field"

/** The invite link until the interview is finished, in case the email didn't reach the
 * candidate or they lost it. */
export async function InviteLinkCard({ token }: { token?: string | null }) {
  const t = await getTranslations("candidates")

  if (!token) {
    return null
  }

  return (
    <div className="space-y-4 p-6">
      <div className="min-w-0 space-y-1 text-base">
        <p className="font-medium lowercase">{t("inviteLinkTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("inviteLinkHint")}</p>
      </div>
      <CopyField path={`/invite/${token}`} />
    </div>
  )
}
