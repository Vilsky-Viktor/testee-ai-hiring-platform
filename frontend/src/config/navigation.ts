// `exact`: current only on that page itself; `section`: current across these pages, not `href`'s.
export const NAV_LINKS = [
  {
    href: "/dashboard",
    section: "/companies",
    label: "hiring",
    signedInOnly: false,
    exact: false,
  },
  {
    href: "/features",
    label: "featuresLink",
    signedInOnly: false,
    exact: false,
  },
  {
    href: "/hiring-flow",
    label: "flowLink",
    signedInOnly: false,
    exact: false,
  },
  {
    href: "/pricing",
    label: "pricingLink",
    signedInOnly: false,
    exact: false,
  },
] as const

// The footer's links in three titled columns: the product, resources to read, and the company;
// `title` and `label` are nav messages.
export const FOOTER_COLUMNS = [
  {
    title: "footerProduct",
    links: [
      { href: "/features", label: "features" },
      { href: "/hiring-flow", label: "hiringFlow" },
      { href: "/tests", label: "tests" },
      { href: "/practice", label: "practice" },
      { href: "/pricing", label: "pricingLink" },
    ],
  },
  {
    title: "footerResources",
    links: [
      { href: "/guides", label: "guides" },
      { href: "/compare", label: "compare" },
      { href: "/faq", label: "faq" },
      { href: "/api-docs", label: "apiDocs" },
    ],
  },
  {
    title: "footerCompany",
    links: [
      { href: "/about", label: "about" },
      { href: "/contact", label: "contact" },
      { href: "/news", label: "news" },
    ],
  },
] as const

// The legal links, in the footer's bottom bar.
export const FOOTER_LEGAL = [
  { href: "/privacy", label: "privacy" },
  { href: "/terms", label: "terms" },
  { href: "/trust", label: "trust" },
  { href: "/accessibility", label: "accessibility" },
  { href: "/documents", label: "docs" },
] as const
