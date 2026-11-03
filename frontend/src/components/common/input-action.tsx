import { cn } from "cn"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchProgress } from "@/components/common/search-progress"
import { SEARCH_OVER_LIST } from "@/config/lists"

type InputActionProps = ComponentProps<typeof Input> & {
  action?: string
  disabled?: boolean
  icon?: ReactNode
  // Controls inside the field, before its button (a search's filters).
  addon?: ReactNode
  // At the end of the text, inside the field (a search's clear button).
  trailing?: ReactNode
  // A search on its way: a light along the field's bottom edge.
  loading?: boolean
}

/** The site's big field with its action button inside; without an `action`, a search as you type
 * (SearchField): no button and no focus border, its `icon` (a magnifier) at the start instead. */
export function InputAction({ addon, ...props }: InputActionProps) {
  return addon ? (
    <FieldWithControls addon={addon} {...props} />
  ) : (
    <Field {...props} />
  )
}

// The icon at the field's start when it has no button.
function Leading({ action, icon }: { action?: string; icon?: ReactNode }) {
  if (action !== undefined || !icon) {
    return null
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none flex shrink-0 items-center text-muted-foreground"
    >
      {icon}
    </span>
  )
}

function ActionButton({
  action,
  disabled,
  icon,
  className,
}: {
  action?: string
  disabled?: boolean
  icon?: ReactNode
  className: string
}) {
  if (action === undefined) {
    return null
  }

  return (
    <Button
      type="submit"
      disabled={disabled}
      size={icon ? "icon" : "default"}
      className={className}
      aria-label={icon ? action : undefined}
    >
      {icon ?? action}
    </Button>
  )
}

// On phones the text takes its own row and the controls the row under it, inside the same
// field, which spans the screen with square corners; from sm up it's one rounded row.
function FieldWithControls({
  action,
  disabled,
  icon,
  addon,
  trailing,
  loading = false,
  ...props
}: InputActionProps) {
  const leading = action === undefined && icon

  return (
    <div
      className={cn(
        "relative -mx-6 flex min-w-0 flex-1 flex-wrap items-center gap-2 border border-transparent bg-surface ps-3 pe-3 pb-3 transition-colors sm:mx-0 sm:flex-nowrap sm:rounded-xl sm:ps-0 sm:pb-0",
        action !== undefined && "focus-within:border-ring-gradient",
        SEARCH_OVER_LIST
      )}
    >
      <span className="hidden empty:hidden sm:ms-6 sm:flex">
        <Leading action={action} icon={icon} />
      </span>
      <span className="flex min-w-0 flex-1 basis-full items-center sm:basis-auto">
        <Input
          className={cn(
            "h-16 min-w-0 flex-1 border-0 bg-transparent px-3 text-lg focus-visible:ring-0 sm:px-6 md:text-lg dark:bg-transparent",
            leading && "sm:ps-3"
          )}
          {...props}
        />
        {trailing}
      </span>
      {addon}
      <SearchProgress loading={loading} />
      <ActionButton
        action={action}
        disabled={disabled}
        icon={icon}
        className="ms-auto size-10 shrink-0 rounded-lg sm:ms-0"
      />
    </div>
  )
}

// The site's big borderless field; an icon button, or a text one (e.g. "share & start").
function Field({
  action,
  disabled,
  icon,
  trailing,
  loading = false,
  ...props
}: InputActionProps) {
  const leading = action === undefined && icon

  return (
    <div
      className={cn(
        "relative min-w-0 flex-1 rounded-xl border border-transparent transition-colors searched:max-sm:-mx-6",
        action !== undefined && "focus-within:border-ring-gradient",
        SEARCH_OVER_LIST
      )}
    >
      {leading && (
        <span className="absolute start-6 top-1/2 flex -translate-y-1/2">
          <Leading action={action} icon={icon} />
        </span>
      )}
      <Input
        className={cn(
          "h-16 border-0 px-6 text-lg focus-visible:ring-0 md:text-lg",
          SEARCH_OVER_LIST,
          leading ? "ps-15 pe-28" : icon ? "pe-20" : "pe-48"
        )}
        {...props}
      />
      <SearchProgress loading={loading} />
      {trailing && (
        <span className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {trailing}
        </span>
      )}
      <ActionButton
        action={action}
        disabled={disabled}
        icon={icon}
        className={
          icon
            ? "absolute end-3 top-3 size-10 rounded-lg"
            : "absolute end-3 top-3 h-10 px-5 text-base"
        }
      />
    </div>
  )
}
