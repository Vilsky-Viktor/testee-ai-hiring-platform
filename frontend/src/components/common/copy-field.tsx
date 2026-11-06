"use client"

import { CopyIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { InputAction } from "@/components/common/input-action"
import { Button } from "@/components/ui/button"
import { useOrigin } from "@/lib/origin"

/** A link on this site (`path`), in a read-only field with a copy button. */
export function CopyField({ path }: { path: string }) {
  const common = useTranslations("common")
  const origin = useOrigin()

  return (
    <CopyValue
      value={origin ? `${origin}${path}` : ""}
      label={common("copyLink")}
      copied={common("linkCopied")}
    />
  )
}

/** The same link as an icon button, for a row with no room for the field. */
export function CopyLinkButton({ path }: { path: string }) {
  const common = useTranslations("common")
  const origin = useOrigin()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 shrink-0 text-muted-foreground hover:text-foreground"
      aria-label={common("copyLink")}
      tooltip={common("copyLink")}
      data-testid="copy-invite"
      onClick={async () => {
        await navigator.clipboard.writeText(`${origin}${path}`)
        toast.success(common("linkCopied"))
      }}
    >
      <CopyIcon className="size-5" />
    </Button>
  )
}

/** Any text to paste elsewhere, in a read-only field with a copy button named `label`. */
export function CopyValue({
  value,
  label,
  copied,
}: {
  value: string
  label: string
  copied: string
}) {
  async function copy(event: React.FormEvent) {
    event.preventDefault()

    if (!value) {
      return
    }

    await navigator.clipboard.writeText(value)
    toast.success(copied)
  }

  return (
    <form onSubmit={copy} className="flex">
      <InputAction
        readOnly
        value={value}
        aria-label={label}
        action={label}
        disabled={!value}
        icon={<CopyIcon className="size-5" />}
        onFocus={(event) => event.target.select()}
      />
    </form>
  )
}
