/** A single resource entry in the /resources page. */
export interface Resource {
  name: string;
  description: string;
  url: string;
  category: string;
}

/**
 * Curated list of tools and resources shown on the /resources page.
 *
 * To add a new resource, append an entry to this array — no structural
 * code changes required (Requirement 12.3).
 *
 * To add a new category, use any new `category` string value; the
 * resources page groups entries by category automatically.
 */
export const resources: Resource[] = [
  {
    name: 'ccstatusline',
    description:
      'A lightweight status line plugin for showing Claude Code context in your terminal prompt.',
    url: 'https://github.com/anthropics/ccstatusline',
    category: 'Developer Tools',
  },
];
