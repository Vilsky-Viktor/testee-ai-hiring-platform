"use client"

import { cn } from "cn"
import { LoaderCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { useSignIn } from "@/components/common/sign-in-dialog"
import { useAuth } from "@/providers/auth-provider"
import { GenerateIn } from "@/components/common/generate-in"
import { Button } from "@/components/ui/button"
import { FLOAT_LABEL, FLOAT_LABEL_UP } from "@/config/floating-label"
import { Textarea } from "@/components/ui/textarea"
import type { Locale } from "@/config/i18n"
import { MAX_GOAL_LENGTH } from "@/config/limits"
import { useDraft } from "@/hooks/use-draft"
import { forgetDraftOnReload, saveDraft } from "@/lib/pending-start"
import { isSubmitShortcut } from "@/lib/keys"

/** The home page's start: paste a job description, sign in if needed, and the page asking
 * which company it's for opens (app/generate/company), the description kept in the tab; back
 * from there, it's in the box again as it was. `hero`: with the pill on its top edge, for the home
 * page's wires to lead to. */
export function StartTest({ hero = false }: { hero?: boolean }) {
  const t = useTranslations("start")
  const signIn = useSignIn()
  const router = useRouter()
  const { user } = useAuth()
  // The description kept in the tab from before (back from choosing the company), until edited;
  // a reload starts empty. Before the first read of it.
  useState(forgetDraftOnReload)
  const kept = useDraft()
  const [typed, setTyped] = useState<string | null>(null)
  const [chosenLanguage, setGenerateIn] = useState<Locale | null>(null)
  // Starts on the interface's language; any supported one can be chosen.
  const locale = useLocale() as Locale
  const text = typed ?? kept?.text ?? ""
  const generateIn = chosenLanguage ?? (kept?.generateIn as Locale) ?? locale
  const [busy, setBusy] = useState(false)

  async function describe(event: React.FormEvent) {
    event.preventDefault()

    // Not marked `required`: the browser would show its own tooltip over the empty box.
    if (!text.trim()) {
      return
    }

    setBusy(true)

    if (!user && !(await signIn())) {
      setBusy(false)

      return
    }

    saveDraft({ text: text.trim(), generateIn })
    router.push("/generate/company")
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (isSubmitShortcut(event)) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  // On phones the box spans the screen, with square corners. The grey is see-through in dark: laid
  // over the page's colour, so nothing behind it shows through.
  const box =
    "relative -mx-6 w-[calc(100%+3rem)] border border-transparent bg-background bg-[linear-gradient(var(--surface),var(--surface))] p-3 transition-colors focus-within:border-ring-gradient sm:mx-0 sm:w-full sm:rounded-xl"

  return (
    <>
      <form onSubmit={describe} className={box}>
        {hero && (
          <span
            className={cn(
              FLOAT_LABEL,
              FLOAT_LABEL_UP,
              "px-16 py-1.5 text-sm lowercase [--bubble:16px]"
            )}
          >
            {t("newInterview")}
          </span>
        )}
        <Textarea
          maxLength={MAX_GOAL_LENGTH}
          value={text}
          onChange={(event) => setTyped(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          aria-label={t("description")}
          className={cn(
            "max-h-72 min-h-40 resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0 max-[399px]:min-h-28 md:text-base dark:bg-transparent [@media(max-height:700px)]:min-h-28",
            hero && "pt-6"
          )}
        />
        {/* The language, then the button at the end; on phones the button takes its own line. */}
        <div className="flex flex-wrap items-center justify-end gap-3 ps-2 pt-2">
          <GenerateIn value={generateIn} onChange={setGenerateIn} />
          <Button
            type="submit"
            className="h-10 px-5 text-base max-sm:w-full"
            disabled={busy || !text.trim()}
          >
            {/* Spinning while signing in and the company page opens. */}
            {busy && <LoaderCircleIcon className="animate-spin" />}
            {t("submit")}
          </Button>
        </div>
      </form>
    </>
  )
}
