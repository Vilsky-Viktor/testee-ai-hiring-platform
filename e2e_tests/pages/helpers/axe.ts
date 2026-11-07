import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

// The one list of what's checked, signed in and signed out: e2e_tests/signed-in/helpers/axe.ts
// is a link to this file, which signed-in.sh sends in as a file.
// WCAG 2.2 AA, the rules axe checks for it.
const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Known issues: found by the scan, tracked here until fixed, rather than turning their rules off.
// Each names the rule, the element (a part of its HTML) and why it waits.
const KNOWN_ISSUES: { rule: string; html: RegExp; why: string }[] = [];

/** What axe finds on the page as it is now, an open dialog included, but the known issues: each
 * rule broken, with its elements (their HTML, as an id alone, Base UI's generated ones, says
 * nothing) and why. */
export async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();

  return results.violations
    .map((violation) => ({
      rule: violation.id,
      nodes: violation.nodes
        .filter(
          (node) =>
            !KNOWN_ISSUES.some((known) => known.rule === violation.id && known.html.test(node.html)),
        )
        .map((node) => `${node.html.slice(0, 200)}: ${node.failureSummary}`),
    }))
    .filter((violation) => violation.nodes.length > 0);
}
