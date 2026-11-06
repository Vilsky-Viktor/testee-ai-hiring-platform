"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"
import { MAX_EMAIL_LENGTH } from "@/config/limits"
import { RolePicker } from "@/features/company/components/role-picker"
import { useInviteMember } from "@/features/company/hooks/use-invite-member"

/** The team page with only its owner: inviting the first teammate, on the page itself. */
export function FirstMember({ companyId }: { companyId: string }) {
  const t = useTranslations("interviews")
  const members = useTranslations("members")
  const { email, setEmail, role, setRole, sending, send } =
    useInviteMember(companyId)

  return (
    <form onSubmit={send} className="mx-auto max-w-xl space-y-4 py-4">
      <h2 className="font-heading text-2xl font-medium tracking-tight">
        {members("firstTitle")}
      </h2>
      <FloatingInput
        label={t("memberEmail")}
        type="email"
        required
        maxLength={MAX_EMAIL_LENGTH}
        placeholder="name@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <RolePicker role={role} onChange={setRole} disabled={sending} />
      <Button
        type="submit"
        className="h-14 w-full text-lg"
        disabled={sending || !email}
      >
        {t("addMember")}
      </Button>
    </form>
  )
}
