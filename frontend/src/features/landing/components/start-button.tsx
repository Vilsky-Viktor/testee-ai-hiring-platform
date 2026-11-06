"use client"

import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { goToStart } from "@/lib/start-box"

/** Back up to the job description box at the top of the home page, ready to type. */
export function StartButton({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <Button
      data-testid="start-button"
      className={cn("h-14 px-10 text-lg", className)}
      onClick={goToStart}
    >
      {label}
    </Button>
  )
}
