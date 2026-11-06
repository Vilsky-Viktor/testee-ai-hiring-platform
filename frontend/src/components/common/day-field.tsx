import { FloatingInput } from "@/components/ui/floating-field"

/** A day picked in a floating-label date field. */
export function DayField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (day: string) => void
}) {
  return (
    <FloatingInput
      label={label}
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
