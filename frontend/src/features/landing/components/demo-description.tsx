import { cn } from "cn"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { DemoPasteMenu } from "@/features/landing/components/demo-paste-menu"
import { buttonVariants } from "@/components/ui/button"

/** The home page's job description box (components/common/start-test.tsx) as a picture, filling
 * its space: `placeholder` until `pasted`, then `text`, its lines sliding in, cut off at the
 * field's bottom; the right-click menu that pastes it, opened at `field` while `menu`; and its button (`send`), dimmed
 * while there's no text, pressed while `pressed` (paste while `pasting`). */
export function DemoDescription({
  text,
  pasted,
  menu,
  pasting,
  pressed,
  placeholder,
  labels,
}: {
  text: string
  pasted: boolean
  menu: boolean
  pasting: boolean
  pressed: boolean
  placeholder: string
  labels: { paste: string; submit: string }
}) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col p-5">
      {/* Pasted, the text's lines slide up one after another, selected as freshly pasted text
          is, and the selection fades (promo-selected, promo.css). */}
      <div className="min-h-0 flex-1 overflow-hidden text-xl">
        {pasted ? (
          <p key="pasted" data-stagger className="*:block">
            {text.split("\n").map((line) => (
              <span key={line}>
                <span className="box-decoration-clone motion-safe:animate-[promo-selected_1.6s_ease-out_both]">
                  {line}
                </span>
              </span>
            ))}
          </p>
        ) : (
          <p className="text-muted-foreground">{placeholder}</p>
        )}
      </div>
      {/* Where the pointer right-clicks, inside the empty box; the menu opens from there. */}
      <span className="absolute start-24 top-20">
        <span data-demo-target="field" className="absolute size-px" />
        <DemoPasteMenu open={menu} pressed={pasting} label={labels.paste} />
      </span>
      <div className="flex justify-end pt-3">
        <span
          data-demo-target="send"
          className={buttonVariants({
            className: cn(
              "h-10 px-5 text-base transition-opacity",
              !pasted && "opacity-50",
              pressed && DEMO_PRESSED
            ),
          })}
        >
          {labels.submit}
        </span>
      </div>
    </div>
  )
}
