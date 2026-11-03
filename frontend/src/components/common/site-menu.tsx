"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { MenuIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { IconButton } from "@/components/common/icon-button"
import { SiteNav } from "@/components/common/site-nav"
import { Wordmark } from "@/components/common/wordmark"
import { DialogOverlay } from "@/components/ui/dialog"

/** The phone's menu, left of the logo: the burger opens a panel sliding in from the start side
 * with the site's main links, large; following one, the close button, Escape or a tap beside it
 * closes it. From sm up the links sit in the header and the burger is hidden. */
export function SiteMenu() {
  const t = useTranslations("nav")
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <IconButton
        label={t("menu")}
        onClick={() => setOpen(true)}
        className="-ms-2 size-10 sm:hidden"
      >
        <MenuIcon className="size-6" />
      </IconButton>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          aria-label={t("menu")}
          className="fixed inset-y-0 start-0 z-50 flex w-[min(20rem,85vw)] flex-col gap-10 bg-popover px-4 py-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-[translate] duration-300 ease-out outline-none data-[ending-style]:-translate-x-full data-[ending-style]:duration-200 data-[ending-style]:ease-in data-[starting-style]:-translate-x-full rtl:data-[ending-style]:translate-x-full rtl:data-[starting-style]:translate-x-full"
        >
          <div className="flex h-8 items-center justify-between">
            <Wordmark className="text-xl leading-none" />
            <IconButton
              label={t("closeMenu")}
              onClick={() => setOpen(false)}
              className="size-8"
            >
              <XIcon />
            </IconButton>
          </div>
          <SiteNav vertical onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
