"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { MEMBER_ROLES, type MemberRole } from "@/config/roles"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import type { CompanyMember } from "@/types/company"

/** Inviting a member by email and role (admin by default); `onSent` once it's gone. */
export function useInviteMember(companyId: string, onSent?: () => void) {
  const t = useTranslations("interviews")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<MemberRole>(MEMBER_ROLES[0])
  const [sending, setSending] = useState(false)

  async function send(event: React.FormEvent) {
    event.preventDefault()
    setSending(true)

    try {
      await apiFetch<CompanyMember>(
        `/companies/members?company_id=${companyId}`,
        {
          method: "POST",
          body: JSON.stringify({ email, role }),
        }
      )
      setEmail("")
      setRole(MEMBER_ROLES[0])
      onSent?.()
      router.refresh()
    } catch (error) {
      // The service says why: already invited or a member already, too many invites waiting
      // (409), the email limits (429).
      toast.error(
        serviceRefusal(error, [403, 409]) ??
          apiErrorMessage(error, t("memberFailed"))
      )
    } finally {
      setSending(false)
    }
  }

  return { email, setEmail, role, setRole, sending, send }
}
