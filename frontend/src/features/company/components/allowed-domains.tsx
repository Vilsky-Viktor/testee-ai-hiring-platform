"use client"

import { cn } from "cn"
import { CheckIcon, LaptopIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { CodeEditor } from "@/components/common/code-editor"
import { CornerSign } from "@/components/common/corner-sign"
import { SavedCheck } from "@/components/common/saved-check"
import { SubtopicList } from "@/components/common/subtopic-list"
import { InfoCard } from "@/components/common/warning-card"
import { AllowedList } from "@/features/company/components/allowed-list"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { embedSnippet } from "@/config/api"
import { SIGN_CARD } from "@/config/cards"
import { WARNING_TONE } from "@/config/tones"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { useOrigin } from "@/lib/origin"

// How domains are written, shown as they'd be typed.
const DOMAIN_EXAMPLES = ["jobs.acme.com", "*.acme.com"]

type Saved = { domains: string[]; allow_localhost: boolean }

/** The API page's SDK tab: whether it's set up, then three steps: the company's allowed domains,
 * the sites that may embed its interviews with the SDK (nothing else uses them), the code to
 * paste, and sending candidates there; then whether localhost may embed too (to try it on the
 * developer's own computer), amber while it's on. Owners and admins change the domains and
 * localhost; every change saves at once. Verification has nothing to do with it. On phones the
 * cards span the screen. */
export function AllowedDomains({
  companyId,
  domains,
  allowLocalhost,
  canEdit,
}: {
  companyId: string
  domains: string[]
  allowLocalhost: boolean
  canEdit: boolean
}) {
  const t = useTranslations("api")
  const [saved, setSaved] = useState<Saved>({
    domains,
    allow_localhost: allowLocalhost,
  })
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark()
  const origin = useOrigin()

  async function save(next: Saved) {
    const kept = await apiFetch<Saved>(
      `/companies/companies/${companyId}/allowed-domains`,
      { method: "PUT", body: JSON.stringify(next) }
    )
    setSaved(kept)

    return kept
  }

  async function toggle(on: boolean) {
    setSaving(true)

    try {
      await save({ ...saved, allow_localhost: on })
      markSaved()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("allowedDomainsFailed")))
    } finally {
      setSaving(false)
    }
  }

  const count = saved.domains.length
  const snippet = embedSnippet(origin ?? "")

  return (
    <section className="space-y-6">
      <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
        <span className="block" data-testid="sdk-status">
          {count > 0 ? t("sdkReady", { count }) : t("sdkNotReady")}
        </span>
        <span className="mt-1 block">{t("sdkRules")}</span>
        <span className="mt-3 block">
          <SubtopicList subtopics={DOMAIN_EXAMPLES} small />
        </span>
      </InfoCard>
      <ol className="space-y-8">
        <Step number={1} done={count > 0} title={t("stepSite")}>
          <AllowedList
            entries={saved.domains}
            label={t("domain")}
            hint={t("domainHint")}
            empty={t("noDomains")}
            removeLabel={(entry) => t("removeEntry", { entry })}
            failed={t("allowedDomainsFailed")}
            canEdit={canEdit}
            save={async (entries) =>
              (await save({ ...saved, domains: entries })).domains
            }
            tag={(entry) => (
              <Badge
                variant="outline"
                className="h-7 shrink-0 px-3 text-xs font-light"
              >
                {entry.startsWith("*.") ? t("allSubdomains") : t("thisSite")}
              </Badge>
            )}
          />
        </Step>
        <Step number={2} title={t("stepCode")}>
          <CodeEditor code={snippet} language="html" />
        </Step>
        <Step number={3} title={t("stepSend")}>
          <p className="text-base text-muted-foreground">{t("stepSendText")}</p>
        </Step>
      </ol>
      <label
        className={cn(
          SIGN_CARD,
          "flex cursor-pointer items-center gap-4 text-base max-sm:-mx-6 max-sm:rounded-none"
        )}
      >
        <CornerSign>
          <LaptopIcon
            className={saved.allow_localhost ? WARNING_TONE : "text-primary"}
          />
        </CornerSign>
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block font-medium lowercase">
            {t("localhostTitle")}
            <span className="blue-dot">.</span>
          </span>
          <span
            className={cn(
              "block text-sm text-muted-foreground",
              saved.allow_localhost && WARNING_TONE
            )}
            data-testid="localhost-note"
          >
            {saved.allow_localhost ? t("localhostOn") : t("localhostText")}
          </span>
        </span>
        <SavedCheck text={savedText()} />
        <Switch
          checked={saved.allow_localhost}
          disabled={saving || !canEdit}
          onCheckedChange={toggle}
        />
      </label>
    </section>
  )
}

/** A setup step: its number, or a check once `done`, its title and what it takes. */
function Step({
  number,
  done = false,
  title,
  children,
}: {
  number: number
  done?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="space-y-3" data-done={done || undefined}>
      <h2 className="no-dot flex items-center gap-3 font-heading text-xl font-medium">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-base tabular-nums"
        >
          {done ? <CheckIcon className="size-4 text-primary" /> : number}
        </span>
        <span className="min-w-0">
          {title}
          <span className="blue-dot">.</span>
        </span>
      </h2>
      {children}
    </li>
  )
}
