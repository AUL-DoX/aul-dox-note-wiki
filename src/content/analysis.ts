import { getCollection, type CollectionEntry } from 'astro:content';
import titleOverrides from '../data-titles.json';
import { categories } from './categories';

export type AnalysisEntry = CollectionEntry<'analysis'>;

export const ANALYSIS_PAGE_SIZE = 10;

const overrides = titleOverrides as Record<string, string>;
const dashboardLoaders = import.meta.glob('../dashboards/**/*.html', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;

export function getAnalysisPath(entry: AnalysisEntry) {
  return `/reference/${entry.id.replace(/\.mdx?$/, '')}/`;
}

export function getAnalysisTime(entry: AnalysisEntry) {
  return (entry.data.updated ?? entry.data.date).getTime();
}

export async function getAnalysisEntries() {
  // 下書き（draft: true）は本番ビルドには出さない。ローカルの npm run dev では確認用に表示する。
  const entries = (await getCollection('analysis')).filter((entry) => import.meta.env.DEV || entry.data.draft !== true);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title, 'ja'));
}

export async function getAnalysisIndexData() {
  const allItems = await getAnalysisEntries();
  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const entry of allItems) {
    categoryCounts.set(entry.data.category, (categoryCounts.get(entry.data.category) ?? 0) + 1);
    for (const tag of entry.data.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'));
  return { allItems, categories, categoryCounts, sortedTags };
}

export function getAnalysisPageItems<T>(items: T[], page: number) {
  const start = (page - 1) * ANALYSIS_PAGE_SIZE;
  return items.slice(start, start + ANALYSIS_PAGE_SIZE);
}

export function getTotalAnalysisPages(items: unknown[]) {
  return Math.max(1, Math.ceil(items.length / ANALYSIS_PAGE_SIZE));
}

// 元データ（ダッシュボード）の表示名。管理画面のタイトル → 本文の<h1> → スラッグ の順。
export async function getDataTitle(slug: string) {
  const override = overrides[`dashboards/${slug}`]?.trim();
  if (override) return override;
  const html = await dashboardLoaders[`../dashboards/${slug}.html`]?.();
  const h1 = html
    ? [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)]
        .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
        .find((text) => text && text !== 'エグゼクティブサマリー')
    : undefined;
  return h1 || slug;
}

export function dataSlugExists(slug: string) {
  return `../dashboards/${slug}.html` in dashboardLoaders;
}

// Data側から「この分析を読む」を出すための逆引き。
export async function getAnalysisForData(slug: string) {
  return (await getAnalysisEntries()).filter((entry) => entry.data.dataSlugs.includes(slug));
}
