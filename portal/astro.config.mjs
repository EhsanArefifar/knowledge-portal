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
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: 'inline-svg',
          // Measure labels with the same self-hosted font the site renders them in;
          // otherwise widths depend on the build machine's fonts and text gets clipped.
          css: new URL('./node_modules/@fontsource-variable/inter/index.css', import.meta.url),
          mermaidConfig: { theme: 'neutral', fontFamily: "'Inter Variable', sans-serif" },
        },
      ],
    ],
  },
  integrations: [contentValidatorIntegration()],
});
