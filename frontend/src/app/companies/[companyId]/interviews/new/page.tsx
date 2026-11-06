import { cn } from "cn"
import { ChevronRightIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { InterviewStart } from "@/features/company/components/interview-start"
import { SignInPage } from "@/components/common/sign-in-page"
import { isPaused } from "@/lib/pause"
import { serverFetch, signedIn } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import type { Company } from "@/types/company"

export const generateMetadata = () => translatedTitle("interviews", "new")

// The way to a finished interview, this page being the first step.
const STEPS = ["describe", "review", "invite"] as const

export default async function NewInterviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  if (!(await signedIn())) {
    return <SignInPage />
  }

  const { companyId } = await params
  const t = await getTranslations("interviews")
  // Asked together: the pause is the platform's, not the company's.
  const [company, paused] = await Promise.all([
    serverFetch<Company>(`/companies/companies/${companyId}`),
    isPaused(),
  ])

  // Viewers don't create tests: back to the company's tests.
  if (company && !company.can_edit) {
    redirect(`/companies/${companyId}/interviews`)
  }

  // Laid out like the home page's start: a title and the box, nothing else.
  return (
    <main className="mx-auto max-w-page px-6">
      <div className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center pt-8 pb-24">
        <div className="w-full max-w-176 space-y-6">
          <ol
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
            data-testid="create-steps"
          >
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRightIcon
                    aria-hidden
                    className="size-4 rtl:-scale-x-100"
                  />
                )}
                <span
                  className={cn(index === 0 && "font-medium text-foreground")}
                  aria-current={index === 0 ? "step" : undefined}
                >
                  {t(`steps.${step}`)}
                </span>
              </li>
            ))}
          </ol>
          <div className="relative">
            <BackLink
              href={`/companies/${companyId}/interviews`}
              help="newInterview"
              className="wide:top-2.5"
            >
              {t("title")}
            </BackLink>
            <h1 className="font-heading text-5xl font-medium tracking-tight text-balance sm:text-6xl">
              {t("createTitle")}
            </h1>
          </div>
          <InterviewStart companyId={companyId} paused={paused} />
        </div>
      </div>
    </main>
  )
}
