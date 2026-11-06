"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { COMPANIES_CHANGED } from "@/config/notifications"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import { refreshVerification } from "@/lib/auth"
import { humanHeaders } from "@/lib/human-check"
import type { Company } from "@/types/company"

/** Creating a company from a typed name, then opening it: its interviews, or `templateId` when
 * choosing where to use a free test. The server's reason a name can't be used is `nameError`. */
export function useCreateCompany(templateId?: string) {
  const t = useTranslations("company")
  const router = useRouter()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  function rename(value: string) {
    setName(value)
    setNameError(null)
  }

  async function create(event: React.FormEvent) {
    event.preventDefault()

    if (!name.trim() || saving) {
      return
    }

    setSaving(true)
    // An email verified since signing in counts at once (a company needs a verified one).
    await refreshVerification()

    try {
      const company = await apiFetch<Company>("/companies/companies", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
        headers: await humanHeaders(),
      })
      // The bell hears the new company at once.
      window.dispatchEvent(new Event(COMPANIES_CHANGED))
      // Choosing where to use a free test: the new company opens on that test.
      router.replace(
        templateId
          ? `/companies/${company.id}/templates/${templateId}`
          : `/companies/${company.id}/interviews`
      )
    } catch (error) {
      // A name taken or as many companies owned as one may (409), or a name too short (422),
      // is said under the field.
      const refused = serviceRefusal(error, [409, 422])

      if (refused) {
        setNameError(refused)
      } else {
        toast.error(apiErrorMessage(error, t("createFailed")))
      }

      setSaving(false)
    }
  }

  return { name, rename, saving, nameError, reset: () => rename(""), create }
}
