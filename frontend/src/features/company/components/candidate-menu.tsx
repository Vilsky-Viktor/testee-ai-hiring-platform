"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { type DotsItem, DotsMenu } from "@/components/common/dots-menu"
import { RemoveCandidate } from "@/features/company/components/remove-candidate"
import { useResendInvite } from "@/features/company/hooks/use-resend-invite"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { useOrigin } from "@/lib/origin"
import type { Candidate, Scorecard } from "@/types/company"

/** A candidate's "⋮" menu, on their row and their page: for owners and admins (`canEdit`), sending
 * the invite again and copying its link while it works, and removing them; `extra` for anyone. */
export function CandidateMenu({
  interviewId,
  candidate,
  canEdit = true,
  extra = [],
  onRemoved,
}: {
  interviewId: string
  candidate: Pick<Candidate, "id" | "email" | "can_resend" | "revokable">
  canEdit?: boolean
  extra?: DotsItem[]
  onRemoved: () => void
}) {
  const t = useTranslations("candidates")
  const common = useTranslations("common")
  const router = useRouter()
  const origin = useOrigin()
  const { resending, resend } = useResendInvite(interviewId, candidate.email)
  const [removing, setRemoving] = useState(false)

  // Read when asked for: the list doesn't carry the link.
  async function copyLink() {
    try {
      const { invite_token: token } = await apiFetch<Scorecard>(
        `/companies/interviews/${interviewId}/candidates/${candidate.id}`
      )
      await navigator.clipboard.writeText(`${origin}/invite/${token}`)
      toast.success(common("linkCopied"))
    } catch (error) {
      toast.error(apiErrorMessage(error, t("copyLinkFailed")))
    }
  }

  const items = [
    ...(canEdit && candidate.can_resend
      ? [
          {
            label: t("resend"),
            onClick: resend,
            disabled: resending,
            testId: "resend-invite",
          },
          { label: common("copyLink"), onClick: copyLink },
        ]
      : []),
    ...extra,
    ...(canEdit
      ? [
          {
            label: t(candidate.revokable ? "revoke" : "erase"),
            onClick: () => setRemoving(true),
            destructive: true,
          },
        ]
      : []),
  ]

  if (items.length === 0) {
    return null
  }

  return (
    <>
      <DotsMenu items={items} />
      {canEdit && (
        <RemoveCandidate
          interviewId={interviewId}
          inviteId={candidate.id}
          email={candidate.email}
          revokable={candidate.revokable ?? false}
          open={removing}
          onOpenChange={setRemoving}
          onRemoved={() => {
            onRemoved()
            router.refresh()
          }}
        />
      )}
    </>
  )
}
