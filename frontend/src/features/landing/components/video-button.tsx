"use client"

import { cn } from "cn"
import { PlayIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PRIMARY_FILL } from "@/config/buttons"
import { HERO_VIDEO_ID } from "@/config/landing"

/** "Watch video": the hero's button (styles/hero-buttons.css) that opens testee's video in a window on the page, played by
 * YouTube's no-cookie player, which loads only once the window opens. A blue ring keeps pulsing
 * out of its round play icon to draw the eye (hidden with reduced motion). */
export function VideoButton() {
  const t = useTranslations("landing")
  const common = useTranslations("common")

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            data-testid="video-button"
            className="hero-pill hero-pill-video"
          />
        }
      >
        <span
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-full"
        >
          <span className="hero-pill-ring animate-ping border-2 border-primary/60 [animation-duration:2s] motion-reduce:hidden" />
        </span>
        <span aria-hidden className={cn("hero-pill-disc", PRIMARY_FILL)}>
          <PlayIcon className="ms-0.5 size-3.5 fill-current sm:size-4" />
        </span>
        <span className="hero-pill-label">{t("watchVideo")}</span>
      </DialogTrigger>
      {/* The close button sits on the window's corner, over its edge; on phones, where the
          window spans the screen, inside it. */}
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[min(80rem,calc((100svh-6rem)*16/9))] sm:overflow-visible"
        bodyClassName="gap-0 px-4 pt-16 pb-4 sm:p-6"
      >
        <DialogClose
          render={
            <Button
              variant="outline"
              size="icon"
              className="absolute end-3 top-3 z-10 size-11 rounded-xl bg-popover transition-[background-color,scale] duration-200 hover:scale-110 hover:bg-surface sm:-end-5 sm:-top-5 dark:bg-popover dark:hover:bg-surface"
            />
          }
        >
          <XIcon className="size-6" />
          <span className="sr-only">{common("close")}</span>
        </DialogClose>
        <DialogTitle className="sr-only">{t("demos")}</DialogTitle>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${HERO_VIDEO_ID}?autoplay=1&rel=0`}
          title={t("demos")}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="aspect-video w-full rounded-xl"
        />
      </DialogContent>
    </Dialog>
  )
}
