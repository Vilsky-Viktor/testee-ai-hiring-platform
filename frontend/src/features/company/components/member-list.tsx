"use client"

import { useTranslations } from "next-intl"

import { FirstMember } from "@/features/company/components/first-member"
import { MemberRow } from "@/features/company/components/member-row"
import { VirtualList } from "@/components/common/virtual-list"
import { usePagedList } from "@/hooks/use-paged-list"
import type { CompanyMember } from "@/types/company"
import { LIST_BOX } from "@/config/lists"

// What each role may do, in the order of what they may do.
const ROLES = ["owner", "admin", "viewer"] as const

function byEmail(member: CompanyMember) {
  return member.email
}

/** A company's team, a page at a time, `initial` being the server's first page: what each role
 * may do, the invites still waiting apart, then those who joined. With only its owner, the way to
 * invite the first teammate (`alone`). */
export function MemberList({
  companyId,
  initial,
  alone,
}: {
  companyId: string
  initial: CompanyMember[]
  alone: boolean
}) {
  const t = useTranslations("members")
  const roles = useTranslations("roles")
  const { items, setItems, loadMore } = usePagedList(
    `/companies/members?company_id=${companyId}`,
    byEmail,
    initial
  )
  const pending = items.filter((member) => !member.joined)
  const joined = items.filter((member) => member.joined)
  const row = (member: CompanyMember) => (
    <MemberRow
      companyId={companyId}
      member={member}
      onRemoved={() =>
        setItems((current) => current.filter((item) => item.id !== member.id))
      }
    />
  )

  return (
    <div className="space-y-6">
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role}>
            <dt className="font-heading text-lg font-medium">
              {roles(role)}
              <span className="blue-dot">.</span>
            </dt>
            <dd className="text-muted-foreground">{roles(`${role}Note`)}</dd>
          </div>
        ))}
      </dl>
      {pending.length > 0 && (
        <section className="space-y-3" data-testid="pending-invites">
          <h2 className="font-heading text-xl font-medium tracking-tight">
            {t("pendingTitle")}
          </h2>
          <div className={LIST_BOX}>
            {pending.map((member) => (
              <div key={member.id}>{row(member)}</div>
            ))}
          </div>
        </section>
      )}
      <VirtualList
        items={joined}
        getKey={byEmail}
        estimateSize={89}
        onEndReached={loadMore}
        className={LIST_BOX}
        renderItem={row}
      />
      {alone && <FirstMember companyId={companyId} />}
    </div>
  )
}
