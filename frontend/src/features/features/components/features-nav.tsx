import { TabNav } from "@/components/common/tab-nav"
import { TAB_BAR } from "@/config/landing-backgrounds"

/** The features page's groups as the site's slim tabs, links to each, on top of the page. */
export function FeaturesNav({
  items,
}: {
  items: { id: string; label: string }[]
}) {
  return (
    <div data-feature-tabs className={`pt-3 ${TAB_BAR}`}>
      <TabNav
        items={items.map((item) => ({ ...item, href: `#${item.id}` }))}
        current={items[0]?.id ?? ""}
      />
    </div>
  )
}
