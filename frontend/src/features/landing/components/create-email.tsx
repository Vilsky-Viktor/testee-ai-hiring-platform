"use client"

import { cn } from "cn"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  FileIcon,
  InboxIcon,
  MenuIcon,
  PencilIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { DemoInviteEmail } from "@/features/landing/components/demo-invite-email"
import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import {
  DEMO_COMPANY,
  DEMO_INTERVIEW,
  DEMO_INVITE_EMAIL,
} from "@/config/create-demo"
import { INBOX, OPENED, STEPS } from "@/config/create-demo-steps"

// The mail app's folders, the inbox first and chosen.
const FOLDERS = [
  { key: "inbox", icon: InboxIcon },
  { key: "starred", icon: StarIcon },
  { key: "sent", icon: SendIcon },
  { key: "drafts", icon: FileIcon },
] as const
// Earlier emails, as grey lines: only the invitation is read.
const OLDER = [0, 1, 2, 3, 4]
const POP =
  "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"
// The sender as the mail app shows it.
const SENDER = "no-reply@testee.ai"

/** The create demo's last screen at step `at`: the candidate's mail app, a generic one in the
 * site's theme (search, folders, the inbox), the invitation arriving at the top unread; then,
 * opened, its header and the email as testee sends it (DemoInviteEmail), its button clicked. */
export function CreateEmail({ at }: { at: { index: number; n: number } }) {
  const t = useTranslations("landing.create.email")
  const step = STEPS[at.index].name
  const arrived = at.index >= INBOX
  const opened = at.index >= OPENED
  const values = {
    company: DEMO_COMPANY,
    title: DEMO_INTERVIEW.title,
    email: DEMO_INVITE_EMAIL,
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border text-sm">
      <div className="flex shrink-0 items-center gap-4 border-b px-4 py-3">
        <MenuIcon className="size-5 text-muted-foreground" />
        <span className="flex h-10 max-w-md flex-1 items-center gap-3 rounded-full bg-surface px-4 text-muted-foreground">
          <SearchIcon className="size-4" />
          {t("search")}
        </span>
        <span className="ms-auto flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground uppercase">
          {DEMO_INVITE_EMAIL[0]}
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-52 shrink-0 flex-col gap-1 p-3 max-md:hidden">
          <span className="mb-3 flex h-12 w-fit items-center gap-3 rounded-2xl bg-surface px-5 font-medium">
            <PencilIcon className="size-4" />
            {t("compose")}
          </span>
          {FOLDERS.map(({ key, icon: Icon }) => (
            <span
              key={key}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-1.5",
                key === "inbox"
                  ? "bg-primary/10 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{t(key)}</span>
              {key === "inbox" && arrived && !opened && (
                <span className={cn("text-xs", POP)}>1</span>
              )}
            </span>
          ))}
        </div>
        <div className="relative grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)] *:[grid-area:1/1]">
          <ul
            className={cn(
              "divide-y overflow-hidden transition-opacity duration-300",
              opened && "invisible opacity-0"
            )}
          >
            {arrived && (
              <li
                data-demo-target="mail"
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  POP,
                  step === "openMail" && DEMO_PRESSED
                )}
              >
                <StarIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="w-28 shrink-0 truncate font-semibold">
                  {t("from")}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-semibold">{t("subject", values)}</span>
                  <span className="text-muted-foreground">
                    {" — "}
                    {t("preheader", values)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold">
                  {t("now")}
                </span>
              </li>
            )}
            {OLDER.map((row) => (
              <li key={row} className="flex items-center gap-3 px-4 py-4">
                <StarIcon className="size-4 shrink-0 text-muted-foreground/40" />
                <span className="h-2.5 w-24 shrink-0 rounded-full bg-surface" />
                <span className="h-2.5 flex-1 rounded-full bg-surface" />
                <span className="h-2.5 w-8 shrink-0 rounded-full bg-surface" />
              </li>
            ))}
          </ul>
          {opened && (
            <div className={cn("flex min-h-0 flex-col overflow-hidden", POP)}>
              <div className="flex shrink-0 items-center gap-5 px-4 py-3 text-muted-foreground">
                <ArrowLeftIcon className="size-4" />
                <ArchiveIcon className="size-4" />
                <Trash2Icon className="size-4" />
              </div>
              <p className="px-4 pb-3 text-xl">{t("subject", values)}</p>
              <div className="flex items-center gap-3 px-4 pb-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-foreground font-semibold text-background">
                  t
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">
                    <span className="font-semibold">{t("from")}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      &lt;{SENDER}&gt;
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("toMe")}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("now")}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <DemoInviteEmail pressed={step === "openInvite"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
