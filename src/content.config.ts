import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const wiki = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/wiki' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    categorySlug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    noteUrl: z.string().url().optional(),
    noteArticles: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
        }),
      )
      .optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    updateNote: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { wiki };
