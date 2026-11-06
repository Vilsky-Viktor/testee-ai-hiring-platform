"use client"

import { CopyIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ROW_HOVER, LIST_BOX } from "@/config/lists"

const PROMPTS = ["passed", "compare", "invite"] as const

/** A few things to ask a connected app, each copied with a click. */
export function AiAppsPrompts() {
  const t = useTranslations("aiApps")

  async function copy(prompt: string) {
    await navigator.clipboard.writeText(prompt)
    toast.success(t("promptCopied"))
  }

  return (
    <section className="space-y-4" data-testid="ai-prompts">
      <h2 className="font-heading text-2xl font-medium">{t("promptsTitle")}</h2>
      <ul className={`${LIST_BOX} overflow-hidden`}>
        {PROMPTS.map((id) => (
          <li key={id}>
            <Button
              variant="ghost"
              className={`h-auto w-full justify-between gap-4 rounded-none px-6 py-4 text-start text-base whitespace-normal normal-case ${ROW_HOVER}`}
              onClick={() => copy(t(`prompts.${id}`))}
            >
              {t(`prompts.${id}`)}
              <CopyIcon
                data-icon="inline-end"
                className="text-muted-foreground"
              />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
