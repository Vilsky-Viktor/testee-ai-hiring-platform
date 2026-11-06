/** A wire's traveller as a small solid dot in the primary colour, for an SVG, with a ring of the
 * page's colour parting it from the wire: `animations` move and fade it along the wire. */
export function Comet({ animations }: { animations: React.ReactNode }) {
  return (
    <g className="motion-reduce:hidden">
      <g opacity={0} data-testid="wire-traveller">
        {animations}
        <circle
          r={6}
          strokeWidth={3}
          className="fill-primary stroke-background"
        />
      </g>
    </g>
  )
}
