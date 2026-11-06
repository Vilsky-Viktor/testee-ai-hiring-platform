"use client"

import { cn } from "cn"
import { LoaderCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import {
  CompanyChoice,
  COMPANY_CHOICE_ROW,
  FULL_LOGO,
  FULL_LOGO_ROW,
} from "@/components/common/company-choice"
import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"
import { FreeNote } from "@/components/common/free-note"
import { LIST_BOX } from "@/config/lists"
import { MAX_COMPANY_NAME_LENGTH } from "@/config/limits"
import { COMPANIES_CHANGED } from "@/config/notifications"
import { useHumanCheck } from "@/hooks/use-human-check"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import { refreshVerification } from "@/lib/auth"
import { humanHeaders } from "@/lib/human-check"
import type { Company } from "@/types/company"

/** Which company an interview is for, as one list in a narrow column: the user's companies, each
 * its logo (or first letter) and name, which opens the interview's generating page
 * (app/generate/new) at once, then a new company, its name and Continue asked under the list.
 * Someone with no company gets only that name and Continue, and `freeCandidates`, if known. */
export function CompanyPicker({
  companies,
  freeCandidates,
}: {
  companies: Company[]
  freeCandidates: number | null
}) {
  const t = useTranslations("start")
  const router = useRouter()
  useHumanCheck()
  const first = companies.length === 0
  const [adding, setAdding] = useState(first)
  // The company whose generating page is opening.
  const [opening, setOpening] = useState<string | null>(null)
  const [name, setName] = useState("")
  // The server's reason the name can't be used (it's taken), shown under the field.
  const [nameError, setNameError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function open(id: string) {
    setOpening(id)
    router.push(`/generate/new?company=${id}`)
  }

  async function create(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNameError(null)

    try {
      // A first company asks its owner to show they're a person, and every company a verified
      // email: one verified since signing in counts at once.
      await refreshVerification()
      const company = await apiFetch<Company>("/companies/companies", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
        headers: await humanHeaders(),
      })
      // The bell hears the new company at once.
      window.dispatchEvent(new Event(COMPANIES_CHANGED))
      open(company.id)
    } catch (error) {
      // A name taken or too short is said under the field.
      const refused = serviceRefusal(error, [409, 422])

      if (refused) {
        setNameError(refused)
      } else {
        toast.error(apiErrorMessage(error, t("failed")))
      }

      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      {!first && (
        <div
          role="group"
          aria-label={t("whichCompany")}
          className={`${LIST_BOX} overflow-hidden`}
        >
          {companies.map((company) => (
            <button
              key={company.id}
              type="button"
              disabled={opening !== null || busy}
              onClick={() => open(company.id)}
              className={cn(COMPANY_CHOICE_ROW, FULL_LOGO_ROW)}
            >
              <CompanyChoice
                name={company.name}
                logo={company.logo_url}
                logoClassName={FULL_LOGO}
                aside={
                  opening === company.id ? (
                    <LoaderCircleIcon className="size-5 shrink-0 animate-spin text-primary" />
                  ) : undefined
                }
              />
            </button>
          ))}
        </div>
      )}
      {!first && !adding && (
        <div className="flex justify-center">
          <Button
            type="button"
            disabled={opening !== null || busy}
            onClick={() => setAdding(true)}
            className="h-12 px-6 text-base"
          >
            {t("newCompany")}
          </Button>
        </div>
      )}
      {adding && (
        <form onSubmit={create} className="space-y-8">
          <div className="space-y-2">
            <FloatingInput
              label={t("companyName")}
              maxLength={MAX_COMPANY_NAME_LENGTH}
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setNameError(null)
              }}
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? "company-name-error" : undefined}
              autoFocus
            />
            {nameError && (
              <p
                id="company-name-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {nameError}
              </p>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              className="h-12 px-10 text-lg"
              disabled={busy || !name.trim()}
            >
              {/* Spinning while the company is made and the generating page opens. */}
              {busy && <LoaderCircleIcon className="animate-spin" />}
              {t("continue")}
            </Button>
          </div>
        </form>
      )}
      {freeCandidates !== null && (
        <FreeNote>{t("freeCandidates", { count: freeCandidates })}</FreeNote>
      )}
    </div>
  )
}
