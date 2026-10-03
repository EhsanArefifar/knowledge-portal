/**
 * Reading progress, stored per browser in localStorage.
 *
 * Markup hooks (rendered by the pages):
 *  - [data-section-id]          gets [data-done] when that section is complete
 *  - [data-progress="id|id|…"]  sets --pct on its .progress child and fills
 *                                [data-progress-label] with "n of m"
 *  - [data-continue="<course>"] link pointed at the last section read in that course
 *  - [data-continue-any]        revealed with the most recent section across courses
 */

const DONE_KEY = 'kp:done:v1';
const LAST_KEY = 'kp:last:v1';

export interface LastVisit {
  id: string;
  url: string;
  title: string;
  courseSlug: string;
  courseTitle: string;
  at: number;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — progress just won't persist */
  }
}

export function getDone(): Set<string> {
  return new Set(read<string[]>(DONE_KEY, []));
}

export function setDone(id: string, done: boolean): void {
  const set = getDone();
  if (done) set.add(id);
  else set.delete(id);
  write(DONE_KEY, [...set]);
  refreshProgressUI();
}

export function getLastVisits(): Record<string, LastVisit> {
  return read<Record<string, LastVisit>>(LAST_KEY, {});
}

export function recordVisit(visit: Omit<LastVisit, 'at'>): void {
  const all = getLastVisits();
  all[visit.courseSlug] = { ...visit, at: Date.now() };
  write(LAST_KEY, all);
}

export function refreshProgressUI(root: ParentNode = document): void {
  const done = getDone();

  root.querySelectorAll<HTMLElement>('[data-section-id]').forEach((el) => {
    el.toggleAttribute('data-done', done.has(el.dataset.sectionId!));
  });

  root.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => {
    const ids = el.dataset.progress!.split('|').filter(Boolean);
    const n = ids.filter((id) => done.has(id)).length;
    const pct = ids.length ? Math.round((n / ids.length) * 100) : 0;
    el.style.setProperty('--pct', `${pct}%`);
    el.querySelectorAll<HTMLElement>('.progress').forEach((bar) => bar.style.setProperty('--pct', `${pct}%`));
    el.querySelectorAll<HTMLElement>('[data-progress-label]').forEach((label) => {
      label.textContent = n === 0 ? 'Not started' : n === ids.length ? 'Completed' : `${n} of ${ids.length} done`;
    });
    el.toggleAttribute('data-complete', ids.length > 0 && n === ids.length);
  });

  const last = getLastVisits();
  root.querySelectorAll<HTMLAnchorElement>('a[data-continue]').forEach((a) => {
    const visit = last[a.dataset.continue!];
    if (!visit) return;
    a.href = visit.url;
    const label = a.querySelector('[data-continue-label]');
    if (label) label.textContent = 'Continue';
  });

  const recent = Object.values(last).sort((a, b) => b.at - a.at)[0];
  root.querySelectorAll<HTMLElement>('[data-continue-any]').forEach((el) => {
    if (!recent) return;
    el.hidden = false;
    const link = el.querySelector<HTMLAnchorElement>('a');
    if (link) link.href = recent.url;
    el.querySelectorAll<HTMLElement>('[data-continue-title]').forEach((t) => (t.textContent = recent.title));
    el.querySelectorAll<HTMLElement>('[data-continue-course]').forEach((t) => (t.textContent = recent.courseTitle));
  });
}

/** Wrap every <pre> in rendered content with a copy-to-clipboard button. */
export function addCopyButtons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLPreElement>('.prose pre, .code-block pre').forEach((pre) => {
    if (pre.parentElement?.classList.contains('pre-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'pre-wrap';
    pre.replaceWith(wrap);
    wrap.appendChild(pre);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy code');
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = 'Copied';
        btn.setAttribute('data-copied', '');
      } catch {
        btn.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.removeAttribute('data-copied');
      }, 1800);
    });
    wrap.appendChild(btn);
  });
}

/**
 * Mermaid SVGs are emitted with width="100%", so wide flowcharts shrink until
 * their labels are unreadable. Show them at natural size in a scrollable frame.
 */
export function enhanceDiagrams(root: ParentNode = document): void {
  root.querySelectorAll<SVGSVGElement>('.prose svg[id^="mermaid"]').forEach((svg) => {
    if (svg.parentElement?.classList.contains('diagram')) return;
    const frame = document.createElement('div');
    frame.className = 'diagram';
    frame.tabIndex = 0;
    frame.setAttribute('role', 'figure');
    frame.setAttribute('aria-label', 'Diagram (scroll horizontally if wide)');
    svg.replaceWith(frame);
    frame.appendChild(svg);
    const natural = svg.viewBox.baseVal?.width;
    if (natural) {
      svg.style.maxWidth = 'none';
      svg.style.width = `${Math.round(natural)}px`;
    }
  });
}
