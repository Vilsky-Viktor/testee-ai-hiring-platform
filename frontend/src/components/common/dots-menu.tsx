"use client"

import { EllipsisVerticalIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ROW_MENU_BUTTON } from "@/config/buttons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ITEM = "px-3 py-2 lowercase"

export type DotsItem = {
  label: string
  // Opens a page, or does something here.
  href?: string
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
  testId?: string
}

/** A "⋮" menu of actions, on a row or at a page's top. */
export function DotsMenu({ items }: { items: DotsItem[] }) {
  const common = useTranslations("common")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="integration-menu"
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
        {items.map(
          ({ label, href, onClick, destructive, disabled, testId }) => (
            <DropdownMenuItem
              key={label}
              className={ITEM}
              variant={destructive ? "destructive" : "default"}
              disabled={disabled}
              data-testid={testId}
              onClick={onClick}
              render={href ? <Link href={href} /> : undefined}
            >
              {label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The menu of what can be connected: its instructions and, once there's one to end,
 * `onDisconnect`. */
export function ConnectionMenu({
  onInstructions,
  onDisconnect,
}: {
  onInstructions: () => void
  onDisconnect?: () => void
}) {
  const t = useTranslations("ats")

  return (
    <DotsMenu
      items={[
        { label: t("instructions"), onClick: onInstructions },
        ...(onDisconnect
          ? [
              {
                label: t("disconnect"),
                onClick: onDisconnect,
                destructive: true,
              },
            ]
          : []),
      ]}
    />
  )
}
