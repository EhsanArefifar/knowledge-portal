import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { cleanSlug, splitNoteHtml, splitTitle, type Heading } from './sections';

const h = (depth: number, slug: string, text: string): Heading => ({ depth, slug, text });

describe('splitNoteHtml', () => {
  it('splits at H2 and keeps H3s as subheadings', () => {
    const html =
      '<h1 id="t">Title</h1><p>Intro text</p>' +
      '<h2 id="a">A</h2><p>a1</p><h3 id="a-1">A.1</h3><p>a2</p>' +
      '<h2 id="b">B</h2><p>b1</p>';
    const res = splitNoteHtml(html, [h(1, 't', 'Title'), h(2, 'a', 'A'), h(3, 'a-1', 'A.1'), h(2, 'b', 'B')], 'Title');
    expect(res.introHtml).toContain('Intro text');
    expect(res.sections.map((s) => s.title)).toEqual(['A', 'B']);
    expect(res.sections[0].subheadings.map((s) => s.slug)).toEqual(['a-1']);
    expect(res.sections[0].html).not.toContain('<h2');
    expect(res.sections[1].html).toBe('<p>b1</p>');
  });

  it('falls back to H3 when there is a single H2', () => {
    const html = '<h2 id="only">Only</h2><p>x</p><h3 id="p">P</h3><p>1</p><h3 id="q">Q</h3><p>2</p>';
    const res = splitNoteHtml(html, [h(2, 'only', 'Only'), h(3, 'p', 'P'), h(3, 'q', 'Q')], 'Note');
    expect(res.sections.map((s) => s.slug)).toEqual(['p', 'q']);
    expect(res.introHtml).toContain('Only');
  });

  it('returns a single section when there are too few headings', () => {
    const res = splitNoteHtml('<p>just text</p>', [], 'Note');
    expect(res.sections).toHaveLength(1);
    expect(res.sections[0].title).toBe('Note');
  });

  it('promotes a long intro to the first section, titled by its heading', () => {
    const words = Array.from({ length: 80 }, (_, i) => `w${i}`).join(' ');
    const html = `<h2 id="claude-101">Claude 101</h2><p>${words}</p><h3 id="p">P</h3><p>1</p><h3 id="q">Q</h3><p>2</p>`;
    const res = splitNoteHtml(html, [h(2, 'claude-101', 'Claude 101'), h(3, 'p', 'P'), h(3, 'q', 'Q')], 'Note');
    expect(res.introHtml).toBe('');
    expect(res.sections.map((s) => s.title)).toEqual(['Claude 101', 'P', 'Q']);
    expect(res.sections[0].html).toBe(`<p>${words}</p>`);
  });

  it('drops an intro that is only a horizontal rule', () => {
    const html = '<h1 id="t">T</h1><hr><h2 id="a">A</h2><p>1</p><h2 id="b">B</h2>';
    const res = splitNoteHtml(html, [h(2, 'a', 'A'), h(2, 'b', 'B')], 'T');
    expect(res.introHtml).toBe('');
  });

  it('never loses body content across sections', () => {
    fc.assert(
      fc.property(fc.array(fc.stringMatching(/^[a-z ]{1,20}$/), { minLength: 2, maxLength: 8 }), (texts) => {
        const heads = texts.map((_, i) => h(2, `s${i}`, `S${i}`));
        const html = texts.map((t, i) => `<h2 id="s${i}">S${i}</h2><p>${t}</p>`).join('');
        const res = splitNoteHtml(html, heads, 'N');
        expect(res.sections.map((s) => s.html).join('')).toBe(texts.map((t) => `<p>${t}</p>`).join(''));
      }),
    );
  });
});

describe('helpers', () => {
  it('cleans github-slugger double dashes', () => {
    expect(cleanSlug('chapter-2--commands-context-tools--hooks')).toBe('chapter-2-commands-context-tools-hooks');
    expect(cleanSlug('-who-')).toBe('who');
  });

  it('extracts chapter eyebrows', () => {
    expect(splitTitle('Chapter 3 — Plan Mode & Specs')).toEqual({ eyebrow: 'Chapter 3', shortTitle: 'Plan Mode & Specs' });
    expect(splitTitle('Hooks')).toEqual({ shortTitle: 'Hooks' });
  });
});
