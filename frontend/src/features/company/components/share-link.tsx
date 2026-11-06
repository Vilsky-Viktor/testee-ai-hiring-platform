"use client"

import { cn } from "cn"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { CopyField } from "@/components/common/copy-field"
import { SavedCheck } from "@/components/common/saved-check"
import { Switch } from "@/components/ui/switch"
import { CARD_PADDING } from "@/config/cards"
import { ROW_HOVER } from "@/config/lists"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"

/** One link for many candidates, for a job ad: on or off, and the link to copy while it's on.
 * Without `canEdit` (a viewer) the switch only shows whether it's on. */
export function ShareLink({
  interviewId,
  linkToken,
  canEdit,
}: {
  interviewId: string
  linkToken: string | null
  canEdit: boolean
}) {
  const t = useTranslations("interviews")
  const router = useRouter()
  const [token, setToken] = useState(linkToken)
  const [shown, setShown] = useState(linkToken)
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark()

  async function toggle(on: boolean) {
    setSaving(true)

    try {
      const saved = await apiFetch<{ link_token: string | null }>(
        `/companies/interviews/${interviewId}/link`,
        { method: "PUT", body: JSON.stringify({ on }) }
      )
      setToken(saved.link_token)
      setShown(saved.link_token ?? shown)
      markSaved()
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("linkFailed")))
    } finally {
      setSaving(false)
    }
  }

  return (
    // One hover across the row and the link it opens.
    <div className={ROW_HOVER}>
      <label
        className={`flex cursor-pointer items-center gap-4 ${CARD_PADDING}`}
      >
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block text-lg font-light">{t("linkTitle")}</span>
          <span className="block text-sm text-muted-foreground">
            {t("linkText")}
          </span>
        </span>
        <SavedCheck text={savedText()} />
        <Switch
          checked={token !== null}
          disabled={saving || !canEdit}
          onCheckedChange={toggle}
        />
      </label>
      {/* Opens smoothly, and closes with the link still in it. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none",
          token ? "grid-rows-[1fr]" : "invisible grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {shown && (
            <div className="px-6 pb-6">
              <CopyField path={`/apply/${shown}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
