"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { DescriptionBox } from "@/components/common/description-box"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import type { Interview } from "@/types/company"

export function NewInterview({
  companyId,
  disabled,
}: {
  companyId: string
  disabled: boolean
}) {
  const t = useTranslations("interviews")
  const start = useTranslations("start")
  const router = useRouter()
  // A sample description: the landing's, already in every language.
  const sample = useTranslations("landing.demoContent.create")

  async function create(text: string, generateIn: string) {
    try {
      const interview = await apiFetch<Interview>(
        `/companies/interviews?company_id=${companyId}`,
        {
          method: "POST",
          body: JSON.stringify({ text, generate_in: generateIn }),
        }
      )
      router.push(
        `/generate/${interview.generation_id}?next=/companies/${companyId}/interviews/${interview.id}`
      )
    } catch (error) {
      // Too many interviews waiting without candidates (409) is the service's own refusal too.
      toast.error(
        serviceRefusal(error, [409]) ?? apiErrorMessage(error, t("startFailed"))
      )
    }
  }

  return (
    <DescriptionBox
      placeholder={start("placeholder")}
      label={t("jobDescription")}
      submitLabel={start("submit")}
      onSubmit={create}
      disabled={disabled}
      example={{ label: t("tryExample"), text: sample("description") }}
    />
  )
}
