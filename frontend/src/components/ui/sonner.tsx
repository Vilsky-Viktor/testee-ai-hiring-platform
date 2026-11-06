"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

// How long a toast stays: the library's 4 seconds is too short to read most of ours.
const TOAST_SECONDS = 8

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      // Long enough to read a sentence or two before it goes.
      duration={TOAST_SECONDS * 1000}
      toastOptions={{
        classNames: {
          // A compact card: the icon in a tinted tile, the text beside it, for every kind of toast.
          toast:
            "cn-toast items-center! gap-3! rounded-xl! p-3! pe-4! text-base! shadow-lg! [&_[data-button]]:text-sm! [&_[data-icon]]:m-0! [&_[data-icon]]:flex! [&_[data-icon]]:size-10! [&_[data-icon]]:items-center! [&_[data-icon]]:justify-center! [&_[data-icon]]:rounded-lg!",
          // The level shows in the tile, on the popover's own background.
          success: "[&_[data-icon]]:bg-primary/10 [&_[data-icon]]:text-primary",
          info: "[&_[data-icon]]:bg-surface [&_[data-icon]]:text-muted-foreground",
          error:
            "[&_[data-icon]]:bg-destructive/10 [&_[data-icon]]:text-destructive",
          warning:
            "[&_[data-icon]]:bg-amber-500/10 [&_[data-icon]]:text-amber-600 dark:[&_[data-icon]]:text-amber-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
