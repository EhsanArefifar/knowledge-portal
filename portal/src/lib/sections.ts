/**
 * Pure helpers that split a note's rendered HTML into reader sections.
 *
 * A note is split at the shallowest heading level that occurs at least twice
 * (H2, falling back to H3). Content before the first split heading becomes the
 * note's intro; each section keeps the headings one level deeper as its
 * "on this page" subtitles.
 */

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface SectionPart {
  anchor: string;
  slug: string;
  title: string;
  /** e.g. "Chapter 2" when the heading reads "Chapter 2 — Commands …" */
  eyebrow?: string;
  /** Title without the eyebrow prefix. */
  shortTitle: string;
  html: string;
  subheadings: Heading[];
}

export interface SplitResult {
  introHtml: string;
  sections: SectionPart[];
}

const HEADING_TAG = /<h([1-6])\b[^>]*?\bid="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g;

export function chooseSplitDepth(headings: Heading[]): number | null {
  for (const depth of [2, 3]) {
    if (headings.filter((h) => h.depth === depth).length >= 2) return depth;
  }
  return null;
}

export function stripTags(html: string): string {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Collapse the double dashes github-slugger leaves behind for punctuation. */
export function cleanSlug(anchor: string): string {
  const s = anchor
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'section';
}

export function splitTitle(title: string): { eyebrow?: string; shortTitle: string } {
  const m = title.match(/^(Chapter|Part|Module|Lesson)\s+(\d+)\s*[—–:-]\s*(.+)$/i);
  if (m) return { eyebrow: `${m[1]} ${m[2]}`, shortTitle: m[3].trim() };
  return { shortTitle: title };
}

/** True when the HTML has readable content beyond rules and whitespace. */
export function hasContent(html: string): boolean {
  return stripTags(html.replace(/<hr\s*\/?>/g, '')).length > 0;
}

export function splitNoteHtml(
  html: string,
  headings: Heading[],
  fallbackTitle: string,
): SplitResult {
  // The H1 is the note title — rendered by the page, not the body.
  const body = html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/, '');
  const depth = chooseSplitDepth(headings);
  const textBySlug = new Map(headings.map((h) => [h.slug, h.text]));

  const tags = [...body.matchAll(HEADING_TAG)].map((m) => ({
    index: m.index!,
    end: m.index! + m[0].length,
    depth: Number(m[1]),
    anchor: m[2],
    text: textBySlug.get(m[2]) ?? stripTags(m[3]),
  }));

  if (depth === null) {
    const { eyebrow, shortTitle } = splitTitle(fallbackTitle);
    return {
      introHtml: '',
      sections: [
        {
          anchor: 'content',
          slug: 'content',
          title: fallbackTitle,
          eyebrow,
          shortTitle,
          html: body,
          subheadings: tags
            .filter((t) => t.depth === 2 || t.depth === 3)
            .map((t) => ({ depth: t.depth, slug: t.anchor, text: t.text })),
        },
      ],
    };
  }

  const boundaries = tags.filter((t) => t.depth === depth);
  const usedSlugs = new Set<string>();
  const sections: SectionPart[] = boundaries.map((b, i) => {
    const stop = i + 1 < boundaries.length ? boundaries[i + 1].index : body.length;
    const sectionHtml = body.slice(b.end, stop);
    let slug = cleanSlug(b.anchor);
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${cleanSlug(b.anchor)}-${n}`;
    usedSlugs.add(slug);
    const { eyebrow, shortTitle } = splitTitle(b.text);
    return {
      anchor: b.anchor,
      slug,
      title: b.text,
      eyebrow,
      shortTitle,
      html: sectionHtml,
      subheadings: tags
        .filter((t) => t.depth === depth + 1 && t.index > b.index && t.index < stop)
        .map((t) => ({ depth: t.depth, slug: t.anchor, text: t.text })),
    };
  });

  const intro = body.slice(0, boundaries[0].index);
  if (!hasContent(intro)) return { introHtml: '', sections };

  // A short blurb stays as the note's intro; real content becomes chapter one
  // so browsing chapter by chapter never skips it.
  if (stripTags(intro).split(' ').length < INTRO_SECTION_WORDS) return { introHtml: intro, sections };

  const lead = tags.find((t) => t.index < boundaries[0].index);
  const title = lead?.text ?? 'Introduction';
  const introBody = lead ? intro.slice(0, lead.index) + intro.slice(lead.end) : intro;
  let slug = lead ? cleanSlug(lead.anchor) : 'introduction';
  if (usedSlugs.has(slug)) slug = `${slug}-intro`;
  const { eyebrow, shortTitle } = splitTitle(title);
  sections.unshift({
    anchor: lead?.anchor ?? 'introduction',
    slug,
    title,
    eyebrow,
    shortTitle,
    html: introBody,
    subheadings: [],
  });
  return { introHtml: '', sections };
}

/** Intros at least this long are promoted to their own section. */
const INTRO_SECTION_WORDS = 60;
