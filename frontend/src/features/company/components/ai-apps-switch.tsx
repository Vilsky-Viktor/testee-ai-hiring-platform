"use client"

import { cn } from "cn"
import { ShieldCheckIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { CornerSign } from "@/components/common/corner-sign"
import { SavedCheck } from "@/components/common/saved-check"
import { Switch } from "@/components/ui/switch"
import { SIGN_CARD } from "@/config/cards"
import { WARNING_TONE } from "@/config/tones"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"

/** Whether members may use the company's data from the AI apps they connected, as the
 * shareable link's card: owners and admins turn it on or off; a viewer only sees it. Off, it's a
 * warning, so a member knows why their app can't see this company. */
export function AiAppsSwitch({
  companyId,
  companyName,
  allowed,
  canEdit,
}: {
  companyId: string
  companyName: string
  allowed: boolean
  canEdit: boolean
}) {
  const t = useTranslations("aiApps")
  const [on, setOn] = useState(allowed)
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark()

  async function toggle(next: boolean) {
    setSaving(true)

    try {
      await apiFetch(`/companies/companies/${companyId}/ai-apps`, {
        method: "PUT",
        body: JSON.stringify({ allowed: next }),
      })
      setOn(next)
      markSaved()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("allowFailed")))
    } finally {
      setSaving(false)
    }
  }

  return (
    <label
      className={cn(
        SIGN_CARD,
        "flex cursor-pointer items-center gap-4 text-base max-sm:-mx-6 max-sm:rounded-none"
      )}
    >
      <CornerSign>
        <ShieldCheckIcon className={on ? "text-primary" : WARNING_TONE} />
      </CornerSign>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block font-medium">
          {t.rich("allowIn", { company: companyName, ...bdi })}
        </span>
        <span
          className={cn(
            "block text-sm text-muted-foreground",
            !on && WARNING_TONE
          )}
          data-testid="ai-apps-note"
        >
          {on ? t("allowOn") : t("allowOff")}
        </span>
      </span>
      <SavedCheck text={savedText()} />
      <Switch
        checked={on}
        disabled={saving || !canEdit}
        onCheckedChange={toggle}
      />
    </label>
  )
}
