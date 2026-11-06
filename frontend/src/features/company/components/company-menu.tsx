"use client"

import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROW_MENU_BUTTON } from "@/config/buttons"
import { RemoveCompany } from "@/features/company/components/remove-company"
import type { Company } from "@/types/company"

const ITEM = "px-3 py-2 lowercase"

/** A company's "…" menu on its row: its pages the user may open, and Remove for its owner. */
export function CompanyMenu({
  company,
  onRemoved,
}: {
  company: Company
  onRemoved: () => void
}) {
  const t = useTranslations("company")
  const common = useTranslations("common")
  const billing = useTranslations("billing")
  const [removing, setRemoving] = useState(false)
  const base = `/companies/${company.id}`
  const pages = [
    ...(company.can_edit
      ? [{ href: `/top-up?company=${company.id}`, label: billing("topUp") }]
      : []),
    { href: `${base}/members`, label: t("team") },
    ...(company.can_edit
      ? [
          { href: `${base}/brand`, label: t("brand") },
          { href: `${base}/billing`, label: t("billing") },
        ]
      : []),
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="company-menu"
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
          {pages.map(({ href, label }) => (
            <DropdownMenuItem
              key={href}
              className={ITEM}
              render={<Link href={href} />}
            >
              {label}
            </DropdownMenuItem>
          ))}
          {company.can_delete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={ITEM}
                variant="destructive"
                data-testid="remove-company"
                onClick={() => setRemoving(true)}
              >
                <Trash2Icon />
                {t("remove")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <RemoveCompany
        companyId={company.id}
        name={company.name}
        open={removing}
        onOpenChange={setRemoving}
        onRemoved={onRemoved}
      />
    </>
  )
}
