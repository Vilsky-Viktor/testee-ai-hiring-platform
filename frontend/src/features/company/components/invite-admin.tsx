"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { RolePicker } from "@/features/company/components/role-picker"
import { useInviteMember } from "@/features/company/hooks/use-invite-member"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MAX_EMAIL_LENGTH } from "@/config/limits"

/** "Add member" beside the page title, opening a dialog for the email and the role (admin by
 * default), as "new company" does. */
export function InviteAdmin({ companyId }: { companyId: string }) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const { email, setEmail, role, setRole, sending, send } = useInviteMember(
    companyId,
    () => setOpen(false)
  )

  return (
    <Dialog open={open} onOpenChange={(next) => !sending && setOpen(next)}>
      <DialogTrigger
        data-testid="add-member"
        render={<Button className="h-12 px-6 text-base" />}
      >
        {t("addMember")}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("addMember")}</DialogTitle>
        </DialogHeader>
        <form id="invite-admin-form" onSubmit={send}>
          <div className="space-y-3">
            {/* The email field as in the report's share dialog. */}
            <div className="relative rounded-xl border border-transparent transition-colors focus-within:border-ring-gradient">
              <Input
                type="email"
                required
                maxLength={MAX_EMAIL_LENGTH}
                placeholder="name@example.com"
                aria-label={t("memberEmail")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-16 border-0 px-6 text-lg focus-visible:ring-0 md:text-lg"
              />
            </div>
            <RolePicker role={role} onChange={setRole} disabled={sending} />
          </div>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                className="h-10 px-5 text-base"
                disabled={sending}
              />
            }
          >
            {common("cancel")}
          </DialogClose>
          <Button
            type="submit"
            form="invite-admin-form"
            className="h-10 px-5 text-base"
            disabled={sending || !email}
          >
            {t("addMember")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
