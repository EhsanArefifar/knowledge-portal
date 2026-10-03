import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({
    pattern: '*/*.md',
    base: '../',
    exclude: ['portal/**', '.kiro/**'],
  }),
  schema: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .passthrough(),
});

// Agent / command / skill definitions — frontmatter varies by kind, so keep it all.
const assets = defineCollection({
  loader: glob({
    pattern: '*/assets/**/*.md',
    base: '../',
    exclude: ['portal/**', '.kiro/**'],
  }),
  schema: z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .passthrough(),
});

export const collections = { notes, assets };
