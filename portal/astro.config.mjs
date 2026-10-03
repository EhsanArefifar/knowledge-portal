import { defineConfig } from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';
import { contentValidatorIntegration } from './src/plugins/contentValidator.ts';

export default defineConfig({
  site: 'https://ehsanarefifar.github.io',
  base: '/knowledge-portal',
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { theme: 'github-dark' },
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'inline-svg' }],
    ],
  },
  integrations: [
    contentValidatorIntegration(),
  ],
});
