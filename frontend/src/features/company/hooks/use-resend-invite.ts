import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"

/** Sends a candidate's invite email again: inviting the same email sends the same link. */
export function useResendInvite(interviewId: string, email: string) {
  const t = useTranslations("candidates")
  const router = useRouter()
  const [resending, setResending] = useState(false)

  async function resend() {
    setResending(true)

    try {
      await apiFetch(`/companies/interviews/${interviewId}/candidates`, {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      toast.success(t.rich("resent", { email, ...bdi }))
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("resendFailed")))
    } finally {
      setResending(false)
    }
  }

  return { resending, resend }
}
