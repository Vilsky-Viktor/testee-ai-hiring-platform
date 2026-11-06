"use client"

import { cn } from "cn"
import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { InterviewStatus } from "@/components/common/interview-status"
import { Dotted } from "@/components/common/dot"
import { buttonVariants } from "@/components/ui/button"

/** An interview's page header, for the landing's pictures: the back arrow, its title, its
 * `status` (named `statusLabel` when given) and size, and at its end the page's "new candidate"
 * button and "⋮" menu; as a `card`, on a card of its own, only the title, status and size. */
export function InterviewHeader({
  title,
  topics,
  questions,
  status = "new",
  statusLabel,
  card = false,
  children,
}: {
  title: string
  topics: number
  questions: number
  status?: "new" | "in_process"
  statusLabel?: string
  card?: boolean
  // The "⋮" menu.
  children?: React.ReactNode
}) {
  const t = useTranslations("templates")
  const practice = useTranslations("practice")
  const interviews = useTranslations("interviews")

  return (
    <div className="flex items-start gap-3 px-1 pt-1">
      {!card && (
        <ArrowLeftIcon
          aria-hidden
          className="mt-0.5 size-6 shrink-0 text-muted-foreground rtl:-scale-x-100"
        />
      )}
      <div className="min-w-0 flex-1 space-y-1.5">
        <p
          className={cn(
            "font-heading leading-tight font-medium",
            card ? "text-xl" : "text-2xl"
          )}
        >
          {title}
        </p>
        {/* On phones the size goes on its own line under the status. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <InterviewStatus status={status} label={statusLabel} />
          <span className="text-xs whitespace-nowrap text-muted-foreground max-sm:basis-full">
            <Dotted
              items={[
                t("topics", { count: topics }),
                practice("questions", { count: questions }),
              ]}
            />
          </span>
        </div>
      </div>
      {!card && (
        <span className="flex shrink-0 items-center gap-2">
          <span
            className={buttonVariants({
              className: "h-10 px-5 text-base max-sm:hidden",
            })}
          >
            {interviews("newCandidate")}
          </span>
          {children}
        </span>
      )}
    </div>
  )
}
