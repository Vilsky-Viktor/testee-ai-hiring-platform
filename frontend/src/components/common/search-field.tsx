"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

import { InputAction } from "@/components/common/input-action"
import { Button } from "@/components/ui/button"
import { SEARCH_DELAY_MS } from "@/config/lists"

// The clear button: a grey a shade darker than the field it sits in, darker again on hover.
const CLEAR_BUTTON =
  "size-9 shrink-0 rounded-lg bg-[color-mix(in_oklch,var(--surface),var(--foreground)_6%)] text-muted-foreground hover:bg-[color-mix(in_oklch,var(--surface),var(--foreground)_12%)] hover:text-foreground"

/** A list's search as you type: no button; once typing pauses, the address's `q` changes (the
 * other parameters, a tab, a sort or filters, stay) and the page lists what it finds, a light
 * gliding along the field's bottom while it loads. Enter searches at once; the clear button empties it.
 * `addon` holds controls inside the field (filters, a sort); `keep` names parameters a search
 * always carries (the interview's candidates tab). */
export function SearchField({
  q,
  label,
  maxLength,
  addon,
  keep = {},
}: {
  q: string
  label: string
  maxLength: number
  addon?: ReactNode
  keep?: Record<string, string>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [value, setValue] = useState(q)
  const [loading, startLoading] = useTransition()
  const timer = useRef<number>(undefined)
  const input = useRef<HTMLInputElement>(null)

  function search(text: string) {
    window.clearTimeout(timer.current)
    const next = new URLSearchParams(params)
    Object.entries(keep).forEach(([key, value]) => next.set(key, value))

    if (text.trim()) {
      next.set("q", text.trim())
    } else {
      next.delete("q")
    }

    if (next.toString() !== params.toString()) {
      startLoading(() =>
        router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
          scroll: false,
        })
      )
    }
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <InputAction
      ref={input}
      // Typed as text: the browser's own clear cross would sit beside ours.
      role="searchbox"
      enterKeyHint="search"
      maxLength={maxLength}
      value={value}
      dir="auto"
      placeholder={label}
      aria-label={label}
      icon={<SearchIcon className="size-5" />}
      addon={addon}
      loading={loading}
      trailing={
        <SearchEnd
          clearable={value !== ""}
          onClear={() => {
            setValue("")
            search("")
            input.current?.focus()
          }}
        />
      }
      onChange={(event) => {
        const text = event.target.value
        setValue(text)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => search(text), SEARCH_DELAY_MS)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          search(value)
        }
      }}
    />
  )
}

/** The end of a search's field: a clear button once something is typed. */
export function SearchEnd({
  clearable,
  onClear,
}: {
  clearable: boolean
  onClear: () => void
}) {
  const t = useTranslations("search")

  return (
    <>
      {clearable && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={CLEAR_BUTTON}
          aria-label={t("clear")}
          onClick={onClear}
        >
          <XIcon />
        </Button>
      )}
    </>
  )
}
