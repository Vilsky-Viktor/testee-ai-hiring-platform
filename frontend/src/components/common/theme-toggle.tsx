"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useInBrowser } from "@/hooks/use-in-browser"

const modes = [
  { value: "system", icon: MonitorIcon },
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
] as const

export function ThemeModes() {
  const t = useTranslations("userMenu")
  const { theme, setTheme } = useTheme()
  // The server doesn't know the visitor's choice: shown once in the browser, as a difference in
  // the first render would stay on the page.
  const picked = useInBrowser() ? theme : undefined

  return (
    <div className="flex w-full gap-1" role="group" aria-label={t("theme")}>
      {modes.map(({ value, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant={picked === value ? "secondary" : "ghost"}
          className="h-8 flex-1 shrink"
          aria-label={t(value)}
          tooltip={t(value)}
          aria-pressed={picked === value}
          onClick={() => setTheme(value)}
        >
          <Icon />
        </Button>
      ))}
    </div>
  )
}
