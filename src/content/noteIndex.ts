import { getCollection } from 'astro:content';
import noteLinks from '../../data/note-links.json';
import { categories } from './categories';
import { getWikiPath, isPublicEntry } from './wiki';

export const NOTE_PAGE_SIZE = 10;

export async function getNoteIndexData() {
  const entries = (await getCollection('wiki')).filter(isPublicEntry);
  const linkedPages = new Map<string, { title: string; path: string; articleTitle: string }[]>();

  for (const entry of entries) {
    for (const article of entry.data.noteArticles ?? []) {
      const pages = linkedPages.get(article.url) ?? [];
      pages.push({ title: entry.data.title, path: getWikiPath(entry), articleTitle: article.title });
      linkedPages.set(article.url, pages);
    }
  }

  const items = noteLinks.items.map((item) => ({
    ...item,
    source: item.source ?? 'rss',
    linkedPages: linkedPages.get(item.url) ?? [],
  }));

  const allItems = items.sort((a, b) => {
    const aTime = a.published ? new Date(a.published).getTime() : 0;
    const bTime = b.published ? new Date(b.published).getTime() : 0;
    return bTime - aTime || a.title.localeCompare(b.title, 'ja');
  });

  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const item of allItems) {
    for (const category of getNoteCategories(item)) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
    for (const tag of getNoteTags(item)) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'));

  return {
    allItems,
    categories,
    categoryCounts,
    sortedTags,
  };
}

export function getNoteText(item: { title?: string; description?: string }) {
  return `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase();
}

export function getNoteCategories(item: { title?: string; description?: string; linkedPages?: { path: string }[] }) {
  const text = getNoteText(item);
  const matched = new Set<string>();

  for (const page of item.linkedPages ?? []) {
    const category = categories.find((item) => page.path.includes(`/wiki/${item.slug}/`));
    if (category) {
      matched.add(category.slug);
    }
  }

  const rules: [string, RegExp][] = [
    ['welfare-dx', /福祉|障害福祉|医療福祉|dx|処遇改善|制度|トリプル改定/i],
    ['employment-support', /就労|a型|b型|工賃|生活保護|年金/i],
    ['care-facility-dx', /介護|要介護|施設|ケア|サービス提供責任者/i],
    ['obsidian', /obsidian|markdown|docshelf|folder index/i],
    ['gas-tools', /gas|google apps script|googleフォーム|spreadsheet|スプレッドシート/i],
    ['aul-tools', /aul|ツール|web block|c-isit|transaction|docshelf/i],
    ['note-series', /①|②|③|④|⑤|⑥|シリーズ|第[0-9１-９一二三四五六七八九十]+回/i],
    ['policy-docs', /行政|自治体|制度|届出|加算|改定|報酬/i],
    ['ai-music-youtube', /youtube|音楽|ai音楽|suno|udio/i],
  ];

  for (const [slug, pattern] of rules) {
    if (pattern.test(text)) {
      matched.add(slug);
    }
  }

  return [...matched];
}

export function getNoteTags(item: { title?: string; description?: string }) {
  const text = getNoteText(item);
  const tags = new Set<string>();
  const rules: [string, RegExp][] = [
    ['福祉DX', /福祉|障害福祉|医療福祉|dx/i],
    ['就労継続支援', /就労|a型|b型|工賃/i],
    ['介護DX', /介護|要介護|施設/i],
    ['Obsidian', /obsidian|markdown/i],
    ['GAS', /gas|google apps script|googleフォーム/i],
    ['AI活用', /ai|chatgpt|claude|gemini/i],
    ['制度メモ', /制度|加算|報酬|改定|届出/i],
  ];

  for (const [tag, pattern] of rules) {
    if (pattern.test(text)) {
      tags.add(tag);
    }
  }

  return [...tags];
}

export function getNotePageItems(items: unknown[], page: number) {
  const start = (page - 1) * NOTE_PAGE_SIZE;
  return items.slice(start, start + NOTE_PAGE_SIZE);
}

export function getTotalNotePages(items: unknown[]) {
  return Math.max(1, Math.ceil(items.length / NOTE_PAGE_SIZE));
}
