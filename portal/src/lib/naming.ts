import type { CollectionEntry } from 'astro:content';

/**
 * Converts a folder/file name to a URL-safe slug.
 * Lowercases, replaces hyphens/underscores/spaces with `-`,
 * strips non-alphanumeric-hyphen characters.
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Converts a folder name to a display title.
 * Replaces hyphens and underscores with spaces, then applies title case
 * to every word.
 */
export function folderToTitle(folderName: string): string {
  return folderName
    .replace(/[-_]+/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/**
 * Extracts the text of the first `# H1` heading from Markdown content.
 * Falls back to `folderToTitle(filename)` (without extension) if no H1 is found.
 */
export function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  // Strip file extension for the fallback
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return folderToTitle(nameWithoutExt);
}

/**
 * Counts entries whose `id` matches the pattern `<course>/<filename>.md`
 * with NO extra path segments (i.e., root-level only, not inside subdirectories).
 *
 * Entry IDs from the glob loader look like: "Course-folder/note-file"
 * (no .md extension in the id, and no extra slashes for root-level files).
 */
export function countNotes(entries: CollectionEntry<'notes'>[], course: string): number {
  // Root-level entries have the shape: "<course>/<filename>" with exactly one slash
  return entries.filter((entry) => {
    const id = entry.id;
    // Must start with the course folder name followed by exactly one slash,
    // and have no further slashes after that.
    const prefix = `${course}/`;
    if (!id.startsWith(prefix)) return false;
    const remainder = id.slice(prefix.length);
    return !remainder.includes('/');
  }).length;
}
