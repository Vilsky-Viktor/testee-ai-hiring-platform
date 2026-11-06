import { cn } from "cn"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"

/** The way home from a page opening with a centred first screen: laid over it, at the top, in the
 * page margin once that fits it, so the first screen stays centred and doesn't move. `className`
 * places it for a page whose first screen doesn't start at the page's top. */
export async function HeroBack({ className }: { className?: string }) {
  const common = await getTranslations("common")

  return (
    <div className={cn("relative", className)}>
      <BackLink
        href="/"
        className="absolute top-6 mb-0 wide:top-12 wide:bottom-auto wide:my-0"
      >
        {common("home")}
      </BackLink>
    </div>
  )
}
