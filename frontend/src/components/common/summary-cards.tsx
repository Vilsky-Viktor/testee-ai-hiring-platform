import type { ReactNode } from "react"

/** Facts at a glance, each in a card under its name. */
export function SummaryCards({
  rows,
  className = "lg:grid-cols-5",
  testId,
}: {
  rows: { id: string; label: string; value: ReactNode }[]
  // How many fit a line on wide screens.
  className?: string
  testId?: string
}) {
  return (
    <dl
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${className}`}
      data-testid={testId}
    >
      {rows.map(({ id, label, value }) => (
        <div
          key={id}
          data-testid={id}
          className="min-w-0 space-y-1 rounded-xl bg-surface p-4"
        >
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="text-base break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
