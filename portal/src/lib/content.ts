/**
 * Builds the course → note → section model the pages render.
 *
 * Course folders are discovered from the `notes` collection; each folder's
 * optional `_course.json` (title, provider, sourceUrl, description) is read
 * from disk so a new course needs no portal code changes.
 */
import { getCollection } from 'astro:content';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { getProvider, type Provider } from '../data/providers';
import { extractTitle, folderToTitle, toSlug } from './naming';
import { splitNoteHtml, type Heading, type SectionPart } from './sections';

/** Astro runs from portal/; course folders live one level up. */
const REPO_ROOT = resolve(process.cwd(), '..');

export interface Section extends SectionPart {
  id: string;
  url: string;
  noteSlug: string;
  noteTitle: string;
  /** 1-based position across the whole course. */
  number: number;
}

export interface Note {
  slug: string;
  title: string;
  url: string;
  introHtml: string;
  sections: Section[];
}

export interface Asset {
  name: string;
  kind: string;
  description: string;
  /** Where the file belongs in a project, e.g. `.claude/agents/foo.md`. */
  installPath: string;
  /** Path inside the course's assets folder, e.g. `agents/foo.md`. */
  relPath: string;
  downloadUrl: string;
  raw: string;
  meta: { label: string; value: string }[];
}

export interface AssetGroup {
  kind: string;
  label: string;
  assets: Asset[];
}

export interface Course {
  slug: string;
  folder: string;
  title: string;
  description?: string;
  provider: Provider;
  sourceUrl?: string;
  url: string;
  notes: Note[];
  sections: Section[];
  assetGroups: AssetGroup[];
  assetCount: number;
  zipUrl?: string;
}

interface CourseFields {
  title?: string;
  slug?: string;
  provider?: string;
  sourceUrl?: string;
  description?: string;
}

/**
 * `_course.json`. A folder is one course by default; `courses` maps note
 * filenames to their own course (e.g. one platform folder holding several
 * courses). Per-course fields fall back to the folder-level ones.
 */
interface CourseMeta extends CourseFields {
  courses?: Record<string, CourseFields>;
}

type NoteEntry = Awaited<ReturnType<typeof getCollection<'notes'>>>[number];
type AssetEntry = Awaited<ReturnType<typeof getCollection<'assets'>>>[number];

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path: string) => `${base}/${path.replace(/^\//, '')}`;

function readCourseMeta(folder: string): CourseMeta {
  const file = resolve(REPO_ROOT, folder, '_course.json');
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch (err) {
    console.warn(`[content] Could not parse ${file}: ${(err as Error).message}`);
    return {};
  }
}

/** Repo-relative path segments of a collection entry, e.g. ["Course", "assets", "agents", "x.md"]. */
function entrySegments(filePath: string | undefined): string[] {
  if (!filePath) return [];
  return relative(REPO_ROOT, resolve(process.cwd(), filePath)).split(sep);
}

const KIND_LABELS: Record<string, string> = {
  agents: 'Subagents',
  commands: 'Slash commands',
  skills: 'Skills',
  hooks: 'Hooks',
};

/** First readable sentence(s) of an agent description, minus the <example> blocks. */
function shortDescription(desc: string | undefined): string {
  if (!desc) return '';
  const text = desc.replace(/\\n/g, '\n').split(/\n|<example>/)[0].trim();
  if (text.length <= 240) return text;
  const cut = text.slice(0, 240);
  return `${cut.slice(0, Math.max(cut.lastIndexOf('. ') + 1, cut.lastIndexOf(' ')))}…`;
}

function assetMeta(data: Record<string, unknown>): { label: string; value: string }[] {
  const fields: [string, string][] = [
    ['model', 'Model'],
    ['argument-hint', 'Arguments'],
    ['allowed-tools', 'Allowed tools'],
    ['tools', 'Tools'],
  ];
  return fields
    .filter(([key]) => typeof data[key] === 'string' && data[key])
    .map(([key, label]) => {
      let value = String(data[key]);
      if (key === 'tools' || key === 'allowed-tools') {
        const parts = value.split(',').map((s) => s.trim());
        value = parts.length > 4 ? `${parts.slice(0, 4).join(', ')} +${parts.length - 4} more` : parts.join(', ');
      }
      return { label, value };
    });
}

let cache: Promise<Course[]> | undefined;

export function getCourses(): Promise<Course[]> {
  cache ??= loadCourses();
  return cache;
}

export async function getCourse(slug: string): Promise<Course | undefined> {
  return (await getCourses()).find((c) => c.slug === slug);
}

async function loadCourses(): Promise<Course[]> {
  const [noteEntries, assetEntries] = await Promise.all([getCollection('notes'), getCollection('assets')]);

  const byFolder = new Map<string, NoteEntry[]>();
  for (const entry of noteEntries) {
    const [folder] = entrySegments(entry.filePath);
    if (!folder) continue;
    if (!byFolder.has(folder)) byFolder.set(folder, []);
    byFolder.get(folder)!.push(entry);
  }

  const courses: Course[] = [];
  for (const folder of [...byFolder.keys()].sort()) {
    const meta = readCourseMeta(folder);
    const entries = byFolder.get(folder)!.sort((a, b) => (a.filePath ?? '').localeCompare(b.filePath ?? ''));
    const fileOf = (e: NoteEntry) => basename(e.filePath ?? e.id);

    // Notes claimed by a per-file course entry; the rest form the folder course.
    const specs: { fields: CourseFields; slug: string; entries: NoteEntry[] }[] = [];
    const claimed = new Set<NoteEntry>();
    for (const [file, fields] of Object.entries(meta.courses ?? {})) {
      const name = file.endsWith('.md') ? file : `${file}.md`;
      const matched = entries.filter((e) => fileOf(e) === name);
      if (!matched.length) {
        console.warn(`[content] ${folder}/_course.json lists "${file}", but no such note exists.`);
        continue;
      }
      matched.forEach((e) => claimed.add(e));
      const merged = { ...meta, ...fields };
      specs.push({ fields: merged, slug: fields.slug ?? toSlug(fields.title ?? basename(name, '.md')), entries: matched });
    }
    const rest = entries.filter((e) => !claimed.has(e));
    if (rest.length) {
      specs.unshift({ fields: meta, slug: meta.slug ?? toSlug(folder), entries: rest });
    }

    // Assets belong to the folder course, or to the first course when the folder is split.
    specs.forEach((spec, i) =>
      courses.push(buildCourse(folder, spec.slug, spec.fields, spec.entries, i === 0 ? assetEntries : [])),
    );
  }
  return courses;
}

function buildCourse(
  folder: string,
  slug: string,
  meta: CourseFields,
  entries: NoteEntry[],
  assetEntries: AssetEntry[],
): Course {
  const notes: Note[] = [];
  const sections: Section[] = [];
  for (const entry of entries) {
    const filename = basename(entry.filePath ?? entry.id, '.md');
    const noteSlug = toSlug(filename);
    const noteTitle = entry.data.title ?? extractTitle(entry.body ?? '', filename);
    const headings = (entry.rendered?.metadata?.headings ?? []) as Heading[];
    const split = splitNoteHtml(entry.rendered?.html ?? '', headings, noteTitle);

    const noteSections = split.sections.map((part) => {
      const section: Section = {
        ...part,
        id: `${slug}/${noteSlug}/${part.slug}`,
        url: href(`courses/${slug}/${noteSlug}/${part.slug}/`),
        noteSlug,
        noteTitle,
        number: sections.length + 1,
      };
      sections.push(section);
      return section;
    });

    notes.push({
      slug: noteSlug,
      title: noteTitle,
      url: href(`courses/${slug}/${noteSlug}/`),
      introHtml: split.introHtml,
      sections: noteSections,
    });
  }

  const groups = new Map<string, Asset[]>();
  for (const entry of assetEntries) {
    const segs = entrySegments(entry.filePath);
    if (segs[0] !== folder || segs[1] !== 'assets') continue;
    const kind = segs[2] ?? 'other';
    const relPath = segs.slice(2).join('/');
    const file = resolve(REPO_ROOT, ...segs);
    const raw = readFileSync(file, 'utf-8');
    const fileBase = basename(file, '.md');
    // Skills are folders (skills/<name>/SKILL.md); name them after the folder.
    const fallbackName = fileBase.toUpperCase() === 'SKILL' ? basename(dirname(file)) : fileBase;
    const data = entry.data as Record<string, unknown>;
    const asset: Asset = {
      name: (entry.data.name ?? entry.data.title ?? fallbackName) as string,
      kind,
      description: shortDescription(entry.data.description),
      installPath: `.claude/${relPath}`,
      relPath,
      downloadUrl: href(`downloads/${slug}/${relPath}`),
      raw,
      meta: assetMeta(data),
    };
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind)!.push(asset);
  }
  const assetGroups = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([kind, assets]) => ({
      kind,
      label: KIND_LABELS[kind] ?? folderToTitle(kind),
      assets: assets.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  const assetCount = assetGroups.reduce((n, g) => n + g.assets.length, 0);

  return {
    slug,
    folder,
    title: meta.title ?? folderToTitle(folder),
    description: meta.description,
    provider: getProvider(meta.provider ?? folderToTitle(folder)),
    sourceUrl: meta.sourceUrl,
    url: href(`courses/${slug}/`),
    notes,
    sections,
    assetGroups,
    assetCount,
    zipUrl: assetCount > 0 ? href(`downloads/${slug}.zip`) : undefined,
  };
}
