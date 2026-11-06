import { getTranslations } from "next-intl/server"

import { EditableTitle } from "@/components/common/editable-title"
import { EntityId } from "@/components/common/entity-id"
import { NoName } from "@/components/common/no-name"
import { WrappedEmail } from "@/components/common/wrapped-email"
import { Badge } from "@/components/ui/badge"
import { MAX_CANDIDATE_NAME_LENGTH } from "@/config/limits"
import { ExtraTime } from "@/features/company/components/extra-time"
import type { Scorecard } from "@/types/company"

/** A candidate's page title: their name, editable, with their email, status and id under it; the
 * email until the name is known, and a way to enter it. */
export async function CandidateTitle({
  card,
  interviewId,
  inviteId,
  status,
}: {
  card: Scorecard
  interviewId: string
  inviteId: string
  status: string
}) {
  const t = await getTranslations("candidates")
  const deleted = card.status === "deleted"
  const nameProps = {
    path: `/companies/interviews/${interviewId}/candidates/${inviteId}/name`,
    maxLength: MAX_CANDIDATE_NAME_LENGTH,
    editable: card.can_edit,
    field: "name",
    label: t("name"),
    editLabel: t("editName"),
  }

  return (
    <div className="min-w-0 space-y-1 [overflow-wrap:anywhere]">
      {deleted ? (
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("deleted")}
        </h1>
      ) : card.name ? (
        <EditableTitle {...nameProps} title={card.name} />
      ) : (
        <>
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            <WrappedEmail email={card.email} />
          </h1>
          <EditableTitle
            {...nameProps}
            title=""
            small
            emptyLabel={<NoName hint={card.can_edit ? "page" : "view"} />}
          />
        </>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {!deleted && card.name && (
          <span className="text-sm break-all text-muted-foreground">
            {card.email}
          </span>
        )}
        <Badge
          variant={card.status === "undelivered" ? "destructive" : "outline"}
          className="h-8 px-4 text-sm font-light"
        >
          {status}
        </Badge>
        <EntityId id={inviteId} />
        {/* Fixed once they start, so it only shows when some was given. */}
        {card.extra_time_options.length === 0 && (
          <ExtraTime
            interviewId={interviewId}
            inviteId={inviteId}
            current={card.extra_time}
            options={[]}
          />
        )}
      </div>
    </div>
  )
}
