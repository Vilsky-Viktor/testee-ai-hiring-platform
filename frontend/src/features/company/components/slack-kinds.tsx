"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { SavedCheck } from "@/components/common/saved-check"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { LIST_BOX } from "@/config/lists"
import { SlackPreview } from "@/features/company/components/slack-preview"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import { hasMessage } from "@/lib/messages"
import { CARD_PADDING } from "@/config/cards"

// The kinds of notification by what they're about; a new kind waits in the last group.
const GROUPS = [
  [
    "candidates",
    ["candidate_finished", "ats_not_invited", "invite_undelivered"],
  ],
  ["interviews", ["interview_ready"]],
  [
    "billing",
    [
      "auto_top_up_charged",
      "auto_top_up_failed",
      "refund_approved",
      "refund_rejected",
    ],
  ],
  ["team", ["note_added"]],
] as const

const LISTED: readonly string[] = GROUPS.flatMap(([, group]) => group)

/** Which of the company's notifications go to its Slack channel, by what they're about, like the
 * email settings, with how the one last pointed at looks there; each change is saved at once.
 * Viewers see them without changing. Owners and admins can send the channel a test. */
export function SlackKinds({
  companyId,
  kinds,
  allKinds,
  canEdit,
}: {
  companyId: string
  kinds: string[]
  allKinds: string[]
  canEdit: boolean
}) {
  const t = useTranslations("slack")
  const [chosen, setChosen] = useState(kinds)
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark<string>()
  const [shown, setShown] = useState(allKinds[0])
  const [testing, setTesting] = useState(false)

  // A kind from the API by its name, or as it is when there's none.
  function named(kind: string) {
    const key = `kinds.${kind}` as const

    return hasMessage(t, key) ? t(key) : kind
  }

  async function toggle(kind: string, on: boolean) {
    const next = on
      ? allKinds.filter((item) => item === kind || chosen.includes(item))
      : chosen.filter((item) => item !== kind)
    setSaving(true)
    setShown(kind)

    try {
      await apiFetch(`/notifications/slack/kinds?company_id=${companyId}`, {
        method: "PUT",
        body: JSON.stringify({ kinds: next }),
      })
      setChosen(next)
      markSaved(kind)
    } catch (error) {
      toast.error(apiErrorMessage(error, t("saveFailed")))
    } finally {
      setSaving(false)
    }
  }

  async function sendTest() {
    setTesting(true)

    try {
      await apiFetch(`/notifications/slack/test?company_id=${companyId}`, {
        method: "POST",
      })
      toast.success(t("testSent"))
    } catch (error) {
      toast.error(
        serviceRefusal(error, [409, 429]) ??
          apiErrorMessage(error, t("testFailed"))
      )
    } finally {
      setTesting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-heading text-2xl font-medium">{t("kindsTitle")}</h2>
        <p className="text-base text-muted-foreground">{t("kindsText")}</p>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className={`${LIST_BOX} overflow-hidden`}>
          {GROUPS.map(([group, members], index) => {
            const rows = allKinds.filter(
              (kind) =>
                (members as readonly string[]).includes(kind) ||
                (index === GROUPS.length - 1 && !LISTED.includes(kind))
            )

            return (
              rows.length > 0 && (
                <div key={group} className={`space-y-3 ${CARD_PADDING}`}>
                  <h3 className="font-medium">{t(`groups.${group}`)}</h3>
                  {rows.map((kind) => (
                    <label
                      key={kind}
                      onPointerEnter={() => setShown(kind)}
                      onFocus={() => setShown(kind)}
                      className="flex cursor-pointer items-center gap-3 text-base font-light text-muted-foreground"
                    >
                      <Checkbox
                        className="size-6 shrink-0 [&_[data-slot=checkbox-indicator]>svg]:size-4"
                        checked={chosen.includes(kind)}
                        disabled={saving || !canEdit}
                        onCheckedChange={(checked) => toggle(kind, checked)}
                      />
                      <span className="min-w-0 flex-1">{named(kind)}</span>
                      <SavedCheck text={savedText(kind)} />
                    </label>
                  ))}
                </div>
              )
            )
          })}
        </div>
        <div className="space-y-4">
          <SlackPreview kind={shown} />
          {canEdit && (
            <Button
              variant="outline"
              className="h-10 w-full text-base"
              disabled={testing}
              data-testid="slack-test"
              onClick={sendTest}
            >
              {t("test")}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
