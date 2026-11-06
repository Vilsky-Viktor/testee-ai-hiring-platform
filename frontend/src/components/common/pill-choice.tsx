"use client"

import { cn } from "cn"

import { PILL, PILL_CHOSEN } from "@/config/pills"

/** A few choices as pills, the chosen one a step stronger. */
export function PillChoice<Value extends string>({
  options,
  value,
  onChange,
  disabled = false,
  keepCase = false,
  testId,
}: {
  options: readonly { value: Value; label: string }[]
  value: Value
  onChange: (value: Value) => void
  disabled?: boolean
  // The options are names, which keep their capitals.
  keepCase?: boolean
  testId?: string
}) {
  return (
    <div className="flex flex-wrap gap-2" data-testid={testId}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          disabled={disabled}
          className={cn(
            PILL,
            option.value === value && PILL_CHOSEN,
            keepCase && "normal-case"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
