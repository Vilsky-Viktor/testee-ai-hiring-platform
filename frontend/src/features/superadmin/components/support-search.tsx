"use client"

import { ChevronRightIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { InputAction } from "@/components/common/input-action"
import { SearchEnd } from "@/components/common/search-field"
import { SearchedList } from "@/components/common/searched-list"
import {
  LIST_BOX,
  LIST_EMPTY,
  ROW_HOVER,
  SEARCH_DELAY_MS,
} from "@/config/lists"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"
import type { SupportResult } from "@/types/superadmin"

// The support page each kind of result opens.
const PAGES = {
  company: "companies",
  interview: "interviews",
  candidate: "candidates",
  user: "users",
} as const

/** The support tab's search: whatever a complaint gives (an ID from "copy id", a page's link,
 * an email, a Paddle transaction or a company's name) finds the companies, interviews and
 * candidates it names, and the account an ID or an email belongs to; each opens its own
 * support page. The API reads the query, asked once typing pauses. */
export function SupportSearch() {
  const t = useTranslations("superadmin")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SupportResult[]>()
  // The query whose search is on its way, for the spinner.
  const [sent, setSent] = useState("")
  const q = query.trim()

  useEffect(() => {
    if (!q) {
      return
    }

    let current = true
    const timer = window.setTimeout(() => {
      setSent(q)
      apiFetch<{ results: SupportResult[] }>(
        "/companies/superadmin/support/search",
        {
          method: "POST",
          body: JSON.stringify({ query: q }),
        }
      )
        .then((found) => current && setResults(found.results))
        .catch((error) =>
          toast.error(apiErrorMessage(error, t("actionFailed")))
        )
    }, SEARCH_DELAY_MS)

    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [q, t])

  // The search alone until it has results (or none), then the two as one block.
  const field = (
    <InputAction
      role="searchbox"
      enterKeyHint="search"
      maxLength={300}
      placeholder={t("supportSearch")}
      aria-label={t("supportSearch")}
      value={query}
      onChange={(event) => {
        setQuery(event.target.value)

        if (!event.target.value.trim()) {
          setResults(undefined)
        }
      }}
      icon={<SearchIcon className="size-5" />}
      loading={sent !== "" && sent === q}
      trailing={
        <SearchEnd
          clearable={query !== ""}
          onClear={() => {
            setQuery("")
            setResults(undefined)
          }}
        />
      }
    />
  )

  if (!results) {
    return field
  }

  return (
    <SearchedList>
      {field}
      {results.length === 0 && (
        <p className={LIST_EMPTY}>{t("supportNotFound")}</p>
      )}
      {results.length > 0 && (
        <ul className={LIST_BOX}>
          {results.map((result) => (
            <li key={`${result.kind}-${result.id}`}>
              <Link
                href={`/superadmin/support/${PAGES[result.kind]}/${result.id}`}
                className={`flex items-center gap-4 p-6 ${ROW_HOVER}`}
              >
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block text-lg font-medium break-words normal-case">
                    {result.title}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {result.company_name && result.kind !== "company"
                      ? t.rich(`supportKinds.${result.kind}`, {
                          company: result.company_name,
                          ...bdi,
                        })
                      : t.rich(`supportKinds.${result.kind}`, {
                          company: "",
                          ...bdi,
                        })}
                  </span>
                </span>
                <ChevronRightIcon
                  aria-hidden
                  className="size-5 shrink-0 text-muted-foreground rtl:-scale-x-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SearchedList>
  )
}
