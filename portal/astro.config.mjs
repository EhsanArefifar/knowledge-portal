import { defineConfig } from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';
import { contentValidatorIntegration } from './src/plugins/contentValidator.ts';

const base = '/knowledge-portal';

export default defineConfig({
  site: 'https://ehsanarefifar.github.io',
  base,
  redirects: {
    '/quick-access': `${base}/resources/`,
  },
  markdown: {
    // Mermaid must bypass Shiki so rehype-mermaid can render it.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      // Colors come from --shiki-light / --shiki-dark, switched by data-theme in global.css.
      defaultColor: false,
    },
    rehypePlugins: [[rehypeMermaid, { strategy: 'inline-svg', mermaidConfig: { theme: 'neutral' } }]],
  },
  integrations: [contentValidatorIntegration()],
});
