import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({
    pattern: '*/*.md',
    base: '../',
    exclude: ['portal/**', '.kiro/**'],
  }),
  schema: z.object({
    title: z.string().optional(),
    provider: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

const assets = defineCollection({
  loader: glob({
    pattern: '*/assets/**/*.md',
    base: '../',
    exclude: ['portal/**', '.kiro/**'],
  }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { notes, assets };
