import { cn } from "cn"
import type { ReactNode } from "react"

import { FloatingInput } from "@/components/ui/floating-field"
import { SavedCheck } from "@/components/common/saved-check"
import { Switch } from "@/components/ui/switch"
import { CARD_PADDING } from "@/config/cards"
import { ROW_HOVER } from "@/config/lists"

/** A group of settings under a small heading and an optional line, as one list; `plain` when its
 * content is a list of its own. */
export function SettingsGroup({
  title,
  description,
  plain = false,
  children,
}: {
  title: string
  description?: string
  plain?: boolean
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {plain ? (
        children
      ) : (
        <div className="divide-y overflow-hidden rounded-2xl border max-sm:-mx-6 max-sm:rounded-none max-sm:border-x-0">
          {children}
        </div>
      )}
    </section>
  )
}

/** A setting's row: its name, a line under it and its control at the end, on its own line on
 * phones. */
export function SettingRow({
  label,
  help,
  children,
}: {
  label: string
  help?: string
  children: ReactNode
}) {
  return (
    <div
      className={`group/row flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch ${CARD_PADDING} ${ROW_HOVER}`}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-lg font-light">{label}</p>
        {help && <p className="text-sm text-muted-foreground">{help}</p>}
      </div>
      {/* A step darker as the row is hovered, so it stays apart from the row's grey. */}
      <div className="shrink-0 *:w-full sm:w-72 group-hover/row:[&_button]:bg-input">
        {children}
      </div>
    </div>
  )
}

/** A yes-or-no setting: its name, an optional line under it, a switch, with SavedCheck's `saved`
 * before it. */
export function SwitchSetting({
  label,
  help,
  checked,
  saved,
  disabled,
  onChange,
}: {
  label: string
  help?: string
  checked: boolean
  saved?: string | null
  disabled: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-4 ${CARD_PADDING} ${ROW_HOVER}`}
    >
      <span className="min-w-0 space-y-1">
        <span className="block text-lg font-light">{label}</span>
        {help && (
          <span className="block text-sm text-muted-foreground">{help}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <SavedCheck text={saved} />
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </span>
    </label>
  )
}

/** A number setting: its name, an optional line under it, the site's
 * field with its unit inside, which saves when left. */
export function NumberSetting({
  label,
  help,
  fieldName,
  unit,
  value,
  saved,
  disabled,
  onChange,
  onSave,
  target,
  focused,
  caret,
}: {
  label: string
  help?: string
  // The field's whole name for screen readers.
  fieldName: string
  unit: string
  value: string
  // FloatingInput's `saved`.
  saved?: string | null
  disabled: boolean
  onChange: (value: string) => void
  onSave: () => void
  // Names the field for a landing demo's pointer.
  target?: string
  // Shown as focused (a landing demo's field being typed in).
  focused?: boolean
  // A typing caret in the field (a landing demo's).
  caret?: boolean
}) {
  return (
    // On phones the field takes its own line.
    <div
      className={`group/row flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch ${CARD_PADDING} ${ROW_HOVER}`}
    >
      <span className="min-w-0 space-y-1">
        <span className="block text-lg font-light">{label}</span>
        {help && (
          <span className="block text-sm text-muted-foreground">{help}</span>
        )}
      </span>
      <span
        data-demo-target={target}
        className="flex shrink-0 items-center gap-3"
      >
        <FloatingInput
          plain
          label={fieldName}
          suffix={unit}
          saved={saved}
          caret={caret}
          boxClassName={cn(
            "mt-0 w-40 group-hover/row:bg-input max-sm:w-full [&>span]:mt-0",
            focused && "border-ring-gradient"
          )}
          type="number"
          inputMode="numeric"
          value={value}
          disabled={disabled}
          className="[appearance:textfield] pt-1 tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(event) => onChange(event.target.value)}
          onBlur={onSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur()
            }
          }}
        />
      </span>
    </div>
  )
}
