"use client"

import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ROW_MENU_BUTTON } from "@/config/buttons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteInterview } from "@/features/company/components/delete-interview"

const ITEM = "px-3 py-2 lowercase"

/** An interview's "⋮" menu on its row: its candidates, trying it, its settings and Delete for
 * those who can change it. */
export function InterviewMenu({
  href,
  interviewId,
  title,
  canEdit,
  onRemoved,
}: {
  href: string
  interviewId: string
  title: string
  canEdit: boolean
  onRemoved: () => void
}) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")
  const [removing, setRemoving] = useState(false)
  const pages = [
    { href: `${href}?tab=candidates`, label: t("candidates") },
    { href: `${href}/try`, label: t("try") },
    ...(canEdit
      ? [{ href: `${href}?tab=settings`, label: t("settings") }]
      : []),
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="interview-menu"
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
          {pages.map((page) => (
            <DropdownMenuItem
              key={page.href}
              className={ITEM}
              render={<Link href={page.href} />}
            >
              {page.label}
            </DropdownMenuItem>
          ))}
          {canEdit && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={ITEM}
                variant="destructive"
                data-testid="delete-interview"
                onClick={() => setRemoving(true)}
              >
                <Trash2Icon />
                {common("delete")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {canEdit && (
        <DeleteInterview
          interviewId={interviewId}
          title={title}
          opened={removing}
          onOpenedChange={setRemoving}
          onRemoved={onRemoved}
        />
      )}
    </>
  )
}
