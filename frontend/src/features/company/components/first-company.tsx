"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"
import { MAX_COMPANY_NAME_LENGTH } from "@/config/limits"
import { useCreateCompany } from "@/features/company/hooks/use-create-company"
import { useHumanCheck } from "@/hooks/use-human-check"

/** The companies page with none yet: the name and the button to start with, on the page itself. */
export function FirstCompany() {
  const t = useTranslations("company")
  useHumanCheck()
  const { name, rename, saving, nameError, create } = useCreateCompany()

  return (
    <form onSubmit={create} className="mx-auto max-w-xl space-y-6 py-8">
      <div className="space-y-2">
        <FloatingInput
          label={t("name")}
          maxLength={MAX_COMPANY_NAME_LENGTH}
          required
          value={name}
          onChange={(event) => rename(event.target.value)}
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
      <Button
        type="submit"
        className="h-14 w-full text-lg"
        disabled={saving || !name.trim()}
      >
        {t("create")}
      </Button>
    </form>
  )
}
