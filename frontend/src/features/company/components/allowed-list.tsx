"use client"

import { useTranslations } from "next-intl"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { DotsMenu } from "@/components/common/dots-menu"
import { apiErrorMessage } from "@/lib/api"

/** A list owners and admins add entries to and take them off (a key's allowed IPs, the
 * company's allowed domains): each change saves the whole list at once, and the list then shows
 * what the API kept (its own spelling of each entry). The API says what's wrong with an entry;
 * nothing is checked here. Others only see it. */
export function AllowedList({
  entries,
  label,
  hint,
  empty,
  removeLabel,
  failed,
  canEdit,
  save,
  tag,
}: {
  entries: string[]
  // The field's name, such as "IP address or range".
  label: string
  // An example shown in the empty field while it's focused, such as "jobs.acme.com".
  hint?: string
  // What an empty list means, such as "Any IP address".
  empty: string
  removeLabel: (entry: string) => string
  failed: string
  canEdit: boolean
  // Saves the whole list; resolves to the list as the API kept it.
  save: (entries: string[]) => Promise<string[]>
  // What to say about an entry, at its end (a domain's reach).
  tag?: (entry: string) => React.ReactNode
}) {
  const t = useTranslations("api")
  const [list, setList] = useState(entries)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)

  async function change(next: string[]) {
    setSaving(true)

    try {
      setList(await save(next))

      return true
    } catch (error) {
      toast.error(apiErrorMessage(error, failed))

      return false
    } finally {
      setSaving(false)
    }
  }

  async function add(event: FormEvent) {
    event.preventDefault()

    if (draft.trim() && (await change([...list, draft.trim()]))) {
      setDraft("")
    }
  }

  return (
    <div className="space-y-4">
      {/* The field to add one, above the list. */}
      {canEdit && (
        <form onSubmit={add}>
          {/* An empty field adds nothing; the button stays enabled, as a disabled one would grey
              the whole field. */}
          <FloatingInput
            label={label}
            placeholder={hint}
            value={draft}
            maxLength={260}
            disabled={saving}
            className="normal-case"
            onChange={(event) => setDraft(event.target.value)}
            action={
              <Button
                type="submit"
                className="h-10 shrink-0 rounded-lg px-5 text-base"
                disabled={saving}
              >
                {t("addEntry")}
              </Button>
            }
          />
        </form>
      )}
      {list.length ? (
        <ul className={`${LIST_BOX} overflow-hidden`}>
          {list.map((entry) => (
            <li
              key={entry}
              className={`group/row flex min-h-14 items-center gap-3 py-2 ps-5 pe-2 ${ROW_HOVER}`}
              data-testid="allowed-entry"
            >
              <span
                data-testid="allowed-value"
                className="min-w-0 flex-1 font-mono text-sm break-all normal-case"
              >
                {entry}
              </span>
              {tag?.(entry)}
              {canEdit && (
                <DotsMenu
                  items={[
                    {
                      label: removeLabel(entry),
                      onClick: () =>
                        change(list.filter((item) => item !== entry)),
                      destructive: true,
                    },
                  ]}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border px-5 py-4 text-sm text-muted-foreground">
          {empty}
        </p>
      )}
    </div>
  )
}
