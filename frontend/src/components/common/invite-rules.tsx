"use client"

import { cn } from "cn"
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { TEXT_LINK } from "@/config/links"
import { bdi } from "@/lib/bidi"

/** The rules of each group numbered on, through all of them. */
function numbered(groups: { title: string; rules: ReactNode[] }[]) {
  let number = 0

  return groups.map(({ title, rules }) => ({
    title,
    rules: rules.map((rule) => {
      number += 1

      return [number, rule] as const
    }),
  }))
}

/** The rules before an interview, in the gray card, by what they're about and numbered in the
 * brand color; on phones it spans the screen, with square corners. Beside the start (md up) it
 * runs the screen's full height, square, scrolling inside when the rules don't fit. */
export function InviteRules({
  company,
  voice,
  viaLink,
  className,
}: {
  company: string
  // Taken by voice: read aloud, the voice only turned into text.
  voice: boolean
  // Opened from the test's shareable link: their own link comes by email, and extra time needs
  // a personal invite.
  viaLink: boolean
  className?: string
}) {
  const t = useTranslations("invite")
  const named = { company: company || t("theCompany"), ...bdi }
  const groups = numbered([
    {
      title: t("groups.how"),
      rules: [
        t("pickOne"),
        t("changePick"),
        ...(voice ? [t("voice")] : []),
        t("unanswered"),
      ],
    },
    {
      title: t("groups.time"),
      rules: [
        t("timeRunsOut"),
        viaLink ? t("savedLink") : t("saved"),
        // Accommodations.
        t.rich(viaLink ? "extraTimeLink" : "extraTime", named),
      ],
    },
    {
      title: t("groups.rights"),
      rules: [
        // The human decision behind the score.
        t.rich("people", named),
        t.rich("stay", {
          link: (chunks) => (
            // In a new tab: the interview stays open, also inside a company's site, whose
            // frame shows nothing else of testee.
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener"
              className={TEXT_LINK}
            >
              {chunks}
            </Link>
          ),
        }),
      ],
    },
  ])

  return (
    <div
      data-testid="invite-rules"
      className={cn(
        "-mx-6 space-y-8 bg-surface p-8 text-start text-base text-muted-foreground sm:mx-0 sm:rounded-xl sm:p-10 md:flex md:flex-col md:self-stretch md:overflow-y-auto md:rounded-none md:[&>section:first-child]:mt-auto md:[&>section:last-child]:mb-auto",
        className
      )}
    >
      {groups.map(({ title, rules }) => (
        <section key={title} className="space-y-4">
          <h2 className="font-heading text-lg font-medium text-foreground">
            {title}
          </h2>
          <ol className="space-y-4">
            {rules.map(([number, rule]) => (
              <li key={number} className="flex items-baseline gap-4">
                <span className="w-6 shrink-0 text-xl font-medium text-primary tabular-nums">
                  {number}.
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
