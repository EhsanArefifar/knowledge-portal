/** Client-side enhancements for rendered notes: code copy buttons and diagram pop-ups. */

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
 * Mermaid SVGs are fitted to the content width. Each gets an expand button
 * that opens a copy at its natural (viewBox) size in a scrollable overlay.
 */
const EXPAND_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
const CLOSE_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

let lightbox: HTMLDialogElement | undefined;

function getLightbox(): HTMLDialogElement {
  if (lightbox) return lightbox;
  lightbox = document.createElement('dialog');
  lightbox.className = 'diagram-lightbox';
  lightbox.setAttribute('aria-label', 'Diagram at full size');
  lightbox.innerHTML =
    `<div class="diagram-lightbox-bar"><span>Diagram · scroll to pan</span>` +
    `<button type="button" class="btn btn-ghost btn-icon" data-close aria-label="Close diagram">${CLOSE_ICON}</button></div>` +
    `<div class="diagram-lightbox-body"><div class="diagram-canvas"></div></div>`;
  lightbox.querySelector('[data-close]')!.addEventListener('click', () => lightbox!.close());
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || (e.target as Element).classList.contains('diagram-lightbox-body')) lightbox!.close();
  });
  lightbox.addEventListener('close', () => {
    lightbox!.querySelector('.diagram-canvas')!.replaceChildren();
  });
  document.body.appendChild(lightbox);
  return lightbox;
}

function openDiagram(svg: SVGSVGElement): void {
  const box = getLightbox();
  const copy = svg.cloneNode(true) as SVGSVGElement;
  const natural = svg.viewBox.baseVal?.width;
  copy.style.maxWidth = 'none';
  if (natural) copy.style.width = `${Math.round(natural)}px`;
  box.querySelector('.diagram-canvas')!.replaceChildren(copy);
  box.showModal();
}

export function enhanceDiagrams(root: ParentNode = document): void {
  root.querySelectorAll<SVGSVGElement>('.prose svg[id^="mermaid"]').forEach((svg) => {
    if (svg.closest('.diagram')) return;
    const figure = document.createElement('figure');
    figure.className = 'diagram';
    const canvas = document.createElement('div');
    canvas.className = 'diagram-canvas';
    svg.replaceWith(figure);
    canvas.appendChild(svg);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'diagram-expand';
    btn.setAttribute('aria-label', 'Open diagram at full size');
    btn.title = 'Open at full size';
    btn.innerHTML = EXPAND_ICON;
    btn.addEventListener('click', () => openDiagram(svg));
    canvas.addEventListener('click', () => openDiagram(svg));

    figure.append(canvas, btn);
  });
}
