/** A single Quick Access link entry. */
export interface QuickAccessLink {
  label: string;
  url: string;
}

/**
 * Curated list of Quick Access links shown on the Homepage and /quick-access page.
 * Requirement 10.1 — exactly these three entries, in this order.
 */
export const quickAccessLinks: QuickAccessLink[] = [
  { label: 'Anthropic Skilljar',     url: 'https://anthropic.skilljar.com' },
  { label: 'Claude Academy',         url: 'https://anthropic.skilljar.com/claude-101' },
  { label: 'Claude Partners Network', url: 'https://partners.anthropic.com' },
];
