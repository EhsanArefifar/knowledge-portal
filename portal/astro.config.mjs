import { defineConfig } from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';
import { contentValidatorIntegration } from './src/plugins/contentValidator.ts';

export default defineConfig({
  site: 'https://earefifa.github.io',
  base: '/claude-code-knowledge-base',
  markdown: {
    syntaxHighlight: 'shiki',
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
