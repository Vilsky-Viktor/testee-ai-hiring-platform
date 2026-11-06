"use client"

import { cn } from "cn"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { BalanceTooltip } from "@/components/common/balance-tooltip"
import { ShortNumber } from "@/components/common/short-number"
import { CompanyMenu } from "@/features/company/components/company-menu"
import { VerifiedBadge } from "@/components/common/verified-badge"
import { CompanyLogo } from "@/components/common/company-logo"
import { PendingBadge } from "@/features/company/components/pending-badge"
import { INTEGRATION_LOGO, ROW_HOVER } from "@/config/lists"
import { WARNING_TONE } from "@/config/tones"
import { firstGrapheme } from "@/lib/graphemes"
import { hasMessage } from "@/lib/messages"
import type { Company } from "@/types/company"

/** A company on the companies list, laid out like an interview's row: its logo tile (the
 * integrations rows' tile, the row's full height), its name with its badge and, unless the user
 * owns it, their role, the one thing to know about it now under them, then its numbers in words.
 * and its "…" menu. The whole row opens the company (`href`). On phones the row starts with the name, and the
 * numbers go under it. */
export function CompanyRow({
  company,
  href,
  picking,
  onRemoved,
}: {
  company: Company
  href: string
  // Choosing a company for a test: the row only opens, with no menu.
  picking: boolean
  onRemoved: () => void
}) {
  const t = useTranslations("company")
  const roles = useTranslations("roles")
  const billing = useTranslations("billing")
  const status = company.status
  return (
    // One hover surface: the link stretches over the whole row; the numbers (their tooltips) and
    // the menu sit on top of it.
    <div
      className={`group/row relative flex items-center gap-4 py-6 pe-3 max-sm:ps-6 ${ROW_HOVER}`}
    >
      <Link
        href={href}
        className="flex min-w-0 flex-1 items-center gap-6 self-stretch after:absolute after:inset-0"
      >
        {/* The logo whole, or its first letter; decorative, the name says it. Not on phones. */}
        <span
          aria-hidden
          data-testid="company-logo"
          className={`${INTEGRATION_LOGO} max-sm:hidden`}
        >
          {company.logo_url ? (
            <CompanyLogo
              url={company.logo_url}
              name=""
              className="size-full object-contain"
            />
          ) : (
            <span className="font-heading text-2xl font-medium text-muted-foreground uppercase">
              {firstGrapheme(company.name)}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-between gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-2">
          <span className="max-w-full min-w-0 space-y-1">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="truncate text-lg font-medium"
                title={company.name}
              >
                {company.name}
              </span>
              {company.verified_domain && (
                <VerifiedBadge
                  domain={company.verified_domain}
                  className="size-5"
                />
              )}
              {company.verification_status === "pending" && (
                <PendingBadge className="size-5" />
              )}
              {company.role !== "owner" && (
                <span className="shrink-0 text-sm text-muted-foreground">
                  {hasMessage(roles, company.role)
                    ? roles(company.role)
                    : company.role}
                </span>
              )}
            </span>
            {status && (
              <span
                data-testid="company-status"
                data-status={status}
                className={cn(
                  "block text-sm text-muted-foreground",
                  status === "low" && WARNING_TONE
                )}
              >
                {t.rich(`status.${status}`, {
                  count: company.finished_count,
                  n: () => <ShortNumber value={company.finished_count} />,
                })}
              </span>
            )}
          </span>
          <span className="relative z-10 flex shrink-0 flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground tabular-nums">
            <span data-testid="interview-count">
              {t.rich("interviewsShort", {
                count: company.interview_count,
                n: () => <ShortNumber value={company.interview_count} />,
              })}
            </span>
            <span data-testid="member-count">
              {t.rich("membersShort", {
                count: company.member_count,
                n: () => <ShortNumber value={company.member_count} />,
              })}
            </span>
            {company.credits != null && (
              // The whole number on hover, as balances have it.
              <span data-testid="credit-count">
                <BalanceTooltip
                  shown={company.credits}
                  balance={company.credits}
                />{" "}
                {billing("creditsWord", { count: company.credits })}
              </span>
            )}
          </span>
        </span>
      </Link>
      {!picking && (
        <div className="relative z-10 flex shrink-0">
          <CompanyMenu company={company} onRemoved={onRemoved} />
        </div>
      )}
    </div>
  )
}
