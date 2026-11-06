"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { CopyValue } from "@/components/common/copy-field"
import { KeepAcronyms } from "@/components/common/keep-acronyms"
import { FloatingInput } from "@/components/ui/floating-field"
import { PillSelect } from "@/components/common/pill-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { WarningCard } from "@/components/common/warning-card"
import { apiErrorMessage, apiFetch } from "@/lib/api"

type Shown = {
  value: string
  title: string
  text: string
  copy: string
  copied: string
  // More to say about it, under it (a key's example).
  after?: (value: string) => React.ReactNode
}

/** What the API made, to copy this once. */
function CreatedStep({ value, shown }: { value: string; shown: Shown }) {
  const common = useTranslations("common")

  return (
    <>
      <DialogHeader>
        <DialogTitle>{shown.title}</DialogTitle>
        <DialogDescription>{shown.text}</DialogDescription>
      </DialogHeader>
      <CopyValue value={value} label={shown.copy} copied={shown.copied} />
      {shown.after?.(value)}
      <DialogFooter>
        <DialogClose render={<Button className="h-10 px-5 text-base" />}>
          {common("close")}
        </DialogClose>
      </DialogFooter>
    </>
  )
}

/** Making a key or a web hook: one field (and a key's expiry and permissions), then what the API
 * made, shown this once to copy. */
export function CreateDialog({
  path,
  field,
  maxLength,
  type = "text",
  label,
  placeholder,
  title,
  failed,
  shown,
  choice,
  ticks,
  triggerClassName = "h-10 shrink-0 px-5 text-base",
  initialValue = "",
}: {
  // The /manage route that makes it, and the field it takes.
  path: string
  field: string
  maxLength: number
  type?: string
  // The trigger's and the submit button's text, the dialog's title, the field's name and hint.
  label: string
  placeholder: string
  title: string
  failed: string
  // What's shown once it's made: which of the answer's values, and the texts around it.
  shown: Shown
  triggerClassName?: string
  // What the field starts with.
  initialValue?: string
  // A second field to pick from, if any (a key's expiry): its name in the body, what it asks
  // (shown until something is picked) and its options; nothing is picked at first.
  choice?: {
    field: string
    label: string
    options: { value: string; label: string }[]
    // An option with a warning under the select while it's picked (a key that never expires).
    warning?: { value: string; text: string }
  }
  // Checkboxes to tick, if any (a key's permissions): their name in the body, what's ticked at
  // first, and the checkboxes themselves; at least one must be ticked.
  ticks?: {
    field: string
    initial: string[]
    render: (
      ticked: string[],
      onChange: (ticked: string[]) => void
    ) => React.ReactNode
  }
}) {
  const common = useTranslations("common")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [picked, setPicked] = useState<string | null>(null)
  const [ticked, setTicked] = useState(ticks?.initial ?? [])
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<string | null>(null)

  const filled = [
    value.trim(),
    !choice || picked,
    !ticks || ticked.length,
  ].every(Boolean)

  async function create(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)

    try {
      const answer = await apiFetch<Record<string, string>>(path, {
        method: "POST",
        body: JSON.stringify({
          [field]: value,
          ...(choice ? { [choice.field]: picked } : {}),
          ...(ticks ? { [ticks.field]: ticked } : {}),
        }),
      })
      // The page reads it again as this closes: a refresh now could take the dialog away with what
      // it shows only this once (the first key's dialog lives in the empty list).
      setCreated(answer[shown.value])
    } catch (error) {
      toast.error(apiErrorMessage(error, failed))
    } finally {
      setSaving(false)
    }
  }

  function changeOpen(next: boolean) {
    if (saving) {
      return
    }

    setOpen(next)

    if (!next) {
      setValue(initialValue)
      setPicked(null)
      setTicked(ticks?.initial ?? [])
      setCreated(null)

      if (created) {
        router.refresh()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button className={triggerClassName} />}>
        {label}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-xl">
        {created ? (
          <CreatedStep value={created} shown={shown} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                <KeepAcronyms text={title} />
              </DialogTitle>
            </DialogHeader>
            <form
              id={`create-${field}`}
              onSubmit={create}
              className="space-y-3"
            >
              <FloatingInput
                label={placeholder}
                required
                type={type}
                autoComplete="off"
                maxLength={maxLength}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              {choice && (
                <PillSelect
                  label={choice.label}
                  placeholder={choice.label}
                  value={picked}
                  options={choice.options}
                  onChange={setPicked}
                />
              )}
              {choice?.warning && picked === choice.warning.value && (
                <WarningCard>{choice.warning.text}</WarningCard>
              )}
              {ticks?.render(ticked, setTicked)}
            </form>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    className="h-10 px-5 text-base"
                    disabled={saving}
                  />
                }
              >
                {common("cancel")}
              </DialogClose>
              <Button
                type="submit"
                form={`create-${field}`}
                className="h-10 px-5 text-base"
                disabled={saving || !filled}
              >
                {label}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
