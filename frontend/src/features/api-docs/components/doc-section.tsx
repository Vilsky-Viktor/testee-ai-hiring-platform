import { KeepAcronyms } from "@/components/common/keep-acronyms"

/** A part of the developer docs under its title, like the page's others ("Base URL"). */
export function DocSection({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-heading text-2xl font-medium">
        {typeof title === "string" ? <KeepAcronyms text={title} /> : title}
      </h2>
      {children}
    </section>
  )
}
