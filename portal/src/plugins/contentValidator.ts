/**
 * Content Validator — Astro Integration
 *
 * Hooks into `astro:build:done` to scan all emitted HTML files for internal
 * <a href> and <img src> references and warns about any that don't resolve to
 * an actual file in the dist/ output directory.
 *
 * Requirements: 18.1, 18.2, 18.3
 * - 18.1: Warn on internal links that don't resolve to an existing file
 * - 18.2: Warn on image references whose source path doesn't resolve
 * - 18.3: Don't silently omit files; warn and note raw-content fallback for
 *         files that cannot be parsed
 *
 * This integration is NON-FATAL — it never throws and never fails the build.
 */

import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Walk a directory recursively and return absolute paths of all files.
 */
function walkDir(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          results.push(...walkDir(full));
        } else {
          results.push(full);
        }
      } catch {
        // Skip unreadable entries silently
      }
    }
  } catch {
    // If the directory can't be read, just return empty
  }
  return results;
}

/**
 * Return true for references that are clearly external (have a protocol) or
 * are fragment-only anchors (start with `#`), mailto:, etc.
 */
function isExternalOrFragment(href: string): boolean {
  if (!href || href.startsWith('#')) return true;
  if (/^[a-z][a-z0-9+\-.]*:/i.test(href)) return true; // any URI scheme
  return false;
}

/**
 * Strip query string and fragment from a path.
 */
function stripQF(path: string): string {
  return path.split('?')[0].split('#')[0];
}

/**
 * Given a local href/src value and the HTML file it came from, resolve the
 * absolute filesystem path it should correspond to in dist/.
 *
 * Handles:
 *  - Absolute paths  (e.g. /knowledge-portal/courses/note/)
 *  - Relative paths  (e.g. ../images/foo.png)
 *
 * Returns null when the reference clearly should be skipped (external/fragment).
 */
function resolveLocalPath(
  ref: string,
  sourceHtmlPath: string,
  distDir: string,
  base: string,
): string | null {
  const clean = stripQF(ref);
  if (isExternalOrFragment(clean)) return null;

  let resolved: string;

  if (clean.startsWith('/')) {
    // Absolute path — strip the base prefix if present, then join with distDir
    let withoutBase = clean;
    if (base && base !== '/' && withoutBase.startsWith(base)) {
      withoutBase = withoutBase.slice(base.length) || '/';
    }
    // Normalise leading slash
    resolved = join(distDir, withoutBase.replace(/^\//, ''));
  } else {
    // Relative path — resolve relative to the source HTML file's directory
    resolved = resolve(dirname(sourceHtmlPath), clean);
  }

  return resolved;
}

/**
 * Check whether `resolved` corresponds to an existing emitted file.
 *
 * Astro often emits directories with an `index.html` for page routes (e.g.
 * `/courses/` → `dist/courses/index.html`), so we also check for an
 * `index.html` inside `resolved` when it looks like a directory path.
 */
function existsInEmittedFiles(resolved: string, emittedSet: Set<string>): boolean {
  // Direct match
  if (emittedSet.has(resolved)) return true;

  // The ref might point to a directory-style route without a trailing slash or
  // without the `.html` extension — try common expansions:
  if (emittedSet.has(resolved + '.html')) return true;
  if (emittedSet.has(join(resolved, 'index.html'))) return true;
  if (emittedSet.has(resolved + '/index.html')) return true;

  return false;
}

// ---------------------------------------------------------------------------
// HTML parsing helpers (regex-based, no external parser dependency)
// ---------------------------------------------------------------------------

type InternalRef = { type: 'link' | 'image'; value: string };

/**
 * Extract all `<a href="…">` and `<img src="…">` values from raw HTML.
 * Handles both single- and double-quoted attribute values.
 */
function extractRefs(html: string): InternalRef[] {
  const refs: InternalRef[] = [];

  // Match <a href="..."> and <a href='...'>
  const aPattern = /<a\s[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m: RegExpExecArray | null;
  while ((m = aPattern.exec(html)) !== null) {
    const value = m[1] ?? m[2];
    if (value !== undefined) refs.push({ type: 'link', value });
  }

  // Match <img src="..."> and <img src='...'>
  const imgPattern = /<img\s[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  while ((m = imgPattern.exec(html)) !== null) {
    const value = m[1] ?? m[2];
    if (value !== undefined) refs.push({ type: 'image', value });
  }

  return refs;
}

// ---------------------------------------------------------------------------
// Integration factory
// ---------------------------------------------------------------------------

/**
 * Returns an Astro integration that validates internal links and image sources
 * in the built HTML output. All findings are emitted as non-fatal console.warn
 * messages so the build always succeeds.
 */
export function contentValidatorIntegration(): AstroIntegration {
  // We capture the resolved `base` from the Astro config so we can strip it
  // from absolute href paths correctly.
  let configBase = '/';

  return {
    name: 'content-validator',

    hooks: {
      'astro:config:done': ({ config }) => {
        // Normalise: ensure base starts with / and does NOT end with /
        const raw = config.base ?? '/';
        configBase = raw === '/' ? '/' : '/' + raw.replace(/^\/|\/$/g, '');
      },

      'astro:build:done': async ({ dir }) => {
        // `dir` is a URL in Astro 5; convert to filesystem path
        const distDir = fileURLToPath(dir);

        // ------------------------------------------------------------------
        // 1. Collect all emitted files
        // ------------------------------------------------------------------
        const allEmittedFiles = walkDir(distDir);
        const emittedSet = new Set(allEmittedFiles);

        // ------------------------------------------------------------------
        // 2. Filter to just HTML files
        // ------------------------------------------------------------------
        const htmlFiles = allEmittedFiles.filter(
          (f) => extname(f).toLowerCase() === '.html',
        );

        if (htmlFiles.length === 0) {
          console.warn('[content-validator] No HTML files found in dist/. Skipping validation.');
          return;
        }

        let totalWarnings = 0;

        // ------------------------------------------------------------------
        // 3. Validate each HTML file
        // ------------------------------------------------------------------
        for (const htmlFile of htmlFiles) {
          let html: string;

          // Requirement 18.3: if file can't be parsed, warn + note raw fallback
          try {
            html = readFileSync(htmlFile, 'utf-8');
          } catch (err) {
            console.warn(
              `[content-validator] Could not read file (raw content fallback): ${htmlFile}\n` +
                `  Reason: ${(err as Error).message}`,
            );
            totalWarnings++;
            continue;
          }

          let refs: InternalRef[];
          try {
            refs = extractRefs(html);
          } catch (err) {
            // Requirement 18.3: warn if parsing fails
            console.warn(
              `[content-validator] Could not parse file (raw content fallback): ${htmlFile}\n` +
                `  Reason: ${(err as Error).message}`,
            );
            totalWarnings++;
            continue;
          }

          // ----------------------------------------------------------------
          // 4. Check each internal reference
          // ----------------------------------------------------------------
          for (const ref of refs) {
            const resolved = resolveLocalPath(
              ref.value,
              htmlFile,
              distDir,
              configBase,
            );

            if (resolved === null) {
              // External or fragment — skip
              continue;
            }

            if (!existsInEmittedFiles(resolved, emittedSet)) {
              const label = ref.type === 'link' ? 'broken link' : 'missing image';
              // Requirements 18.1 / 18.2: warn with source file + unresolved target
              console.warn(
                `[content-validator] ${label}:\n` +
                  `  source : ${htmlFile}\n` +
                  `  target : ${ref.value}`,
              );
              totalWarnings++;
            }
          }
        }

        if (totalWarnings > 0) {
          console.warn(
            `[content-validator] Validation complete — ${totalWarnings} warning(s) found.`,
          );
        } else {
          console.log(
            `[content-validator] Validation complete — no broken links or missing images found.`,
          );
        }
      },
    },
  };
}
