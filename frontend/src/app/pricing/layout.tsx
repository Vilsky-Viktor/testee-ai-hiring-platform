import { CornerNet } from "@/features/landing/components/corner-net"

/** The pricing page, whichever way it renders, with the net in its top right corner. */
export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <CornerNet />
      {children}
    </div>
  )
}
