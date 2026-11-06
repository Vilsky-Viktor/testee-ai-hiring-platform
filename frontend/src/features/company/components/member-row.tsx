"use client"

import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { CopyLinkButton } from "@/components/common/copy-field"
import { WrappedEmail } from "@/components/common/wrapped-email"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ROW_HOVER } from "@/config/lists"
import type { MemberRole } from "@/config/roles"
import { MemberMenu } from "@/features/company/components/member-menu"
import { RolePicker } from "@/features/company/components/role-picker"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { formatDay } from "@/lib/format"
import { firstGrapheme } from "@/lib/graphemes"
import { hasMessage } from "@/lib/messages"
import type { CompanyMember } from "@/types/company"

/** A member or a pending invite: their picture or first letter, name and email, when they joined
 * or were invited, their role (a choice for the owner) and their menu; an invite also has the way
 * to copy its link. On phones the role and menu take their own line. */
export function MemberRow({
  companyId,
  member,
  onRemoved,
}: {
  companyId: string
  member: CompanyMember
  onRemoved: () => void
}) {
  const t = useTranslations("members")
  const roles = useTranslations("roles")
  const locale = useLocale()
  const [role, setRole] = useState(member.role)
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark()

  // The owner changes an admin to a viewer or back; the row shows the new role once saved.
  async function changeRole(next: MemberRole) {
    if (next === role) {
      return
    }

    setSaving(true)

    try {
      await apiFetch(
        `/companies/members/${member.id}/role?company_id=${companyId}`,
        { method: "PUT", body: JSON.stringify({ role: next }) }
      )
      setRole(next)
      markSaved()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("roleFailed")))
    } finally {
      setSaving(false)
    }
  }

  const since = member.joined ? member.joined_at : member.created_at

  return (
    <div
      className={`group/row flex items-center justify-between gap-4 p-6 max-sm:flex-wrap max-sm:gap-3 ${ROW_HOVER}`}
    >
      <span className="flex min-w-0 items-center gap-4 max-sm:basis-full">
        <Avatar size="lg">
          {member.photo_url && <AvatarImage src={member.photo_url} alt="" />}
          <AvatarFallback>
            {firstGrapheme(member.name ?? member.email).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0">
          <span className="block text-lg font-medium">
            {member.name ?? <WrappedEmail email={member.email} />}
          </span>
          {member.name && (
            <span className="block text-sm text-muted-foreground">
              <WrappedEmail email={member.email} />
            </span>
          )}
          <span className="block text-sm text-muted-foreground">
            {since
              ? t(member.joined ? "joinedOn" : "invitedOn", {
                  date: formatDay(since, locale),
                })
              : t(member.joined ? "joined" : "invited")}
          </span>
        </span>
      </span>
      <span className="flex items-center gap-2 max-sm:basis-full">
        {!member.joined && member.token && (
          <CopyLinkButton path={`/join/${member.token}`} />
        )}
        {/* The owner manages every row but their own: its role, and its menu. */}
        {member.removable ? (
          <>
            <RolePicker
              role={role as MemberRole}
              onChange={changeRole}
              disabled={saving}
              className="w-44"
              saved={savedText()}
            />
            <MemberMenu
              companyId={companyId}
              member={member}
              onRemoved={onRemoved}
            />
          </>
        ) : (
          <Badge variant="secondary" className="h-8 px-4 text-sm font-light">
            {hasMessage(roles, role) ? roles(role) : role}
          </Badge>
        )}
      </span>
    </div>
  )
}
