"use client"

import { CrownIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROW_MENU_BUTTON } from "@/config/buttons"
import { MakeOwner } from "@/features/company/components/make-owner"
import { RemoveMember } from "@/features/company/components/remove-member"
import type { CompanyMember } from "@/types/company"

const ITEM = "px-3 py-2 lowercase"

/** A member's "⋮" menu: handing them the company, and removing them or withdrawing their
 * invite. */
export function MemberMenu({
  companyId,
  member,
  onRemoved,
}: {
  companyId: string
  member: CompanyMember
  onRemoved: () => void
}) {
  const t = useTranslations("members")
  const common = useTranslations("common")
  const [makingOwner, setMakingOwner] = useState(false)
  const [removing, setRemoving] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="member-menu"
          render={
            <Button
              variant="ghost"
              size="icon"
              className={ROW_MENU_BUTTON}
              aria-label={common("moreActions")}
            />
          }
        >
          <EllipsisVerticalIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          {member.can_own && (
            <DropdownMenuItem
              className={ITEM}
              data-testid="make-owner"
              onClick={() => setMakingOwner(true)}
            >
              <CrownIcon />
              {t("makeOwner")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className={ITEM}
            variant="destructive"
            data-testid="remove-member"
            onClick={() => setRemoving(true)}
          >
            <Trash2Icon />
            {t("remove")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {member.can_own && (
        <MakeOwner
          companyId={companyId}
          member={member}
          open={makingOwner}
          onOpenChange={setMakingOwner}
        />
      )}
      <RemoveMember
        companyId={companyId}
        member={member}
        open={removing}
        onOpenChange={setRemoving}
        onRemoved={onRemoved}
      />
    </>
  )
}
