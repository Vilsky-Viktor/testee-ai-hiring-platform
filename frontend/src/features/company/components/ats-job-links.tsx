"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { LinkJob } from "@/features/company/components/ats-link-job"
import { DotsMenu } from "@/components/common/dots-menu"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ShortNumber } from "@/components/common/short-number"
import { Button } from "@/components/ui/button"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"
import type { AtsProvider } from "@/config/ats"
import type { AtsJobLink, Interview } from "@/types/company"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { WARNING_TONE } from "@/config/tones"
import { CARD } from "@/config/cards"

/** The ATS's jobs linked to the company's interviews, on the ATS's own page, with "Link a job"
 * for owners and admins; those with candidates left out come first. With none yet, the way to link
 * the first and what it takes. */
export function AtsJobLinks({
  companyId,
  provider,
  links,
  interviews,
  canEdit,
}: {
  companyId: string
  provider: AtsProvider
  links: AtsJobLink[]
  interviews: Interview[]
  canEdit: boolean
}) {
  const t = useTranslations("ats")
  const ordered = links.toSorted(
    (one, other) => Number(other.not_invited > 0) - Number(one.not_invited > 0)
  )

  if (links.length === 0) {
    return (
      <section
        className={`mx-auto max-w-xl space-y-6 ${CARD}`}
        data-testid="no-links"
      >
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          {t("firstJobTitle")}
        </h2>
        <p className="text-base text-muted-foreground">
          {t("flowStage", { ats: provider.name })}
        </p>
        {canEdit && (
          <LinkJob
            companyId={companyId}
            provider={provider}
            interviews={interviews}
            triggerClassName="h-14 w-full text-lg"
          />
        )}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-medium">{t("links")}</h2>
        {canEdit && (
          <LinkJob
            companyId={companyId}
            provider={provider}
            interviews={interviews}
          />
        )}
      </div>
      <ul className={LIST_BOX}>
        {ordered.map((link) => (
          <LinkRow
            key={link.id}
            companyId={companyId}
            link={link}
            canEdit={canEdit}
          />
        ))}
      </ul>
    </section>
  )
}

function LinkRow({
  companyId,
  link,
  canEdit,
}: {
  companyId: string
  link: AtsJobLink
  canEdit: boolean
}) {
  const t = useTranslations("ats")
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function unlink() {
    setBusy(true)

    try {
      await apiFetch(`/ats/links/${link.id}?company_id=${companyId}`, {
        method: "DELETE",
      })
      setConfirming(false)
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("unlinkFailed")))
    } finally {
      setBusy(false)
    }
  }

  return (
    <li
      className={`group/row flex flex-wrap items-center gap-x-6 gap-y-3 p-6 ${ROW_HOVER}`}
    >
      {/* On phones the job's line ends with the "⋮"; the numbers go under. */}
      <span className="min-w-0 flex-1 space-y-1 max-sm:basis-[calc(100%-4rem)]">
        <span className="block text-lg font-medium">{link.job_name}</span>
        <span className="block text-sm text-muted-foreground">
          {t.rich("rowStage", { stage: link.stage_name, ...bdi })}
        </span>
        <span className="block text-sm text-muted-foreground">
          {t.rich("rowInterview", {
            interview: link.interview_title ?? t("generatingInterview"),
            ...bdi,
            link: (chunks) => (
              <Link
                href={`/companies/${companyId}/interviews/${link.interview_id}`}
                className="font-medium text-foreground"
              >
                {chunks}
              </Link>
            ),
          })}
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground tabular-nums max-sm:order-2">
        <span data-testid="invited-count">
          {t.rich("invitedShort", {
            n: () => <ShortNumber value={link.invited} />,
          })}
        </span>
        {link.waiting > 0 && (
          <span data-testid="waiting-count">
            {t.rich("waitingShort", {
              n: () => <ShortNumber value={link.waiting} />,
            })}
          </span>
        )}
      </span>
      {link.not_invited > 0 && (
        <NotInvited companyId={companyId} link={link} canEdit={canEdit} />
      )}
      {canEdit && (
        <span className="flex max-sm:order-1">
          <DotsMenu
            items={[
              {
                label: t("unlink"),
                onClick: () => setConfirming(true),
                destructive: true,
              },
            ]}
          />
        </span>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("unlinkTitle")}
        text={t.rich("unlinkText", { job: link.job_name, ...bdi })}
        confirm={t("unlink")}
        busy={busy}
        onConfirm={unlink}
      />
    </li>
  )
}

/** Candidates the ATS sent who weren't invited: their number in amber, beside "Invite again" for
 * owners and admins, which tries this job's again (after a top-up, or once the pause is off). */
function NotInvited({
  companyId,
  link,
  canEdit,
}: {
  companyId: string
  link: AtsJobLink
  canEdit: boolean
}) {
  const t = useTranslations("ats")
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function retry() {
    setBusy(true)

    try {
      await apiFetch(`/ats/links/${link.id}/retry?company_id=${companyId}`, {
        method: "POST",
      })
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("inviteAgainFailed")))
    } finally {
      setBusy(false)
    }
  }

  return (
    <span
      className="flex items-center gap-3 max-sm:order-3"
      data-testid="not-invited"
    >
      <span className={`text-sm ${WARNING_TONE}`}>
        {t.rich("notInvitedShort", {
          n: () => <ShortNumber value={link.not_invited} />,
        })}
      </span>
      {canEdit && (
        <Button
          variant="outline"
          className="h-10 px-5 text-base"
          disabled={busy}
          onClick={retry}
        >
          {t("inviteAgain")}
        </Button>
      )}
    </span>
  )
}
