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

// Data（経営の見える化など）の分析結果を読み解くサマリ記事。noteには載せず、Referenceに置く。
// 置き場所：src/content/analysis/<スラッグ>.md → /reference/<スラッグ>/
const analysis = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/analysis' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Dataのタブslug（data-categories.json の dataCategories.slug：kaigo / shogai / keiei）
    category: z.string(),
    tags: z.array(z.string()).default([]),
    // 元データのスラッグ（src/dashboards/ からの相対。例: keiei/r8-kyufu-gappo-202607-dai1）。複数可
    dataSlugs: z.array(z.string()).default([]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { wiki, analysis };
