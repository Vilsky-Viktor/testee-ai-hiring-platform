"use client"

import { HistoryIcon, SparklesIcon, SquarePenIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { useTranslations } from "next-intl"

import { MenuPill } from "@/components/common/menu-pill"
import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"
import type { Company } from "@/types/company"
import { ROUND_ICON_BUTTON } from "@/config/buttons"

// The company picker's value for all companies.
const ALL = "all"

/** The assistant panel's header: its sparkle and `title` (just Mira's name on phones beside a
 * picker), a quiet company picker (when there are `companies`), New chat, History (when
 * `history` isn't null, pressed while it shows) and Close. */
export function PanelHeader({
  title,
  companies,
  company,
  onPick,
  history,
  onHistory,
  onNewChat,
}: {
  title: string
  companies: Company[]
  company: string | null
  onPick: (company: string | null) => void
  history: boolean | null
  onHistory: () => void
  onNewChat: () => void
}) {
  const t = useTranslations("assistant")
  const common = useTranslations("common")

  return (
    <div className="flex h-14 shrink-0 items-center gap-1 border-b px-4">
      <SparklesIcon aria-hidden className="me-1 size-4 shrink-0 text-primary" />
      <p
        className={cn(
          "truncate font-heading text-base font-medium",
          companies.length > 0 && "max-sm:hidden"
        )}
      >
        {title}
      </p>
      {companies.length > 0 && (
        <p className="font-heading text-base font-medium sm:hidden">
          {t("name")}
        </p>
      )}
      <div className="ms-1 min-w-0 flex-1" data-testid="assistant-company">
        {companies.length > 0 && (
          <MenuPill
            ariaLabel={t("company")}
            value={company ?? ALL}
            options={[
              { value: ALL, label: t("allCompanies"), keepCase: true },
              ...companies.map((item) => ({
                value: item.id,
                label: item.name,
                keepCase: true,
              })),
            ]}
            onChange={(value) => onPick(value === ALL ? null : value)}
            className="h-9 max-w-44 px-2.5 pe-7 text-sm text-muted-foreground hover:bg-input [&>svg]:end-2 [&>svg]:size-4"
          />
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={ROUND_ICON_BUTTON}
        aria-label={t("newChat")}
        data-testid="assistant-new-chat"
        onClick={onNewChat}
      >
        <SquarePenIcon className="size-5" />
      </Button>
      {history !== null && (
        <Button
          variant="ghost"
          size="icon"
          className={ROUND_ICON_BUTTON}
          aria-label={t("history")}
          data-testid="assistant-history"
          aria-pressed={history}
          onClick={onHistory}
        >
          <HistoryIcon className="size-5" />
        </Button>
      )}
      <DialogClose
        render={
          <Button
            variant="ghost"
            size="icon"
            className={ROUND_ICON_BUTTON}
            aria-label={common("close")}
            data-testid="assistant-close"
          />
        }
      >
        <XIcon className="size-5" />
      </DialogClose>
    </div>
  )
}
