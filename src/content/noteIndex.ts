import { getCollection } from 'astro:content';
import noteLinks from '../../data/note-links.json';
import noteMagazines from '../../data/note-magazines.json';
import noteHashtags from '../../data/note-hashtags.json';
import { categories, UNCATEGORIZED_SLUG } from './categories';
import { getWikiPath, isPublicEntry } from './wiki';

const urlToMagazineSlugs = new Map<string, string[]>();
for (const magazine of noteMagazines.magazines) {
  for (const url of magazine.articleUrls) {
    const slugs = urlToMagazineSlugs.get(url) ?? [];
    slugs.push(magazine.key);
    urlToMagazineSlugs.set(url, slugs);
  }
}

const urlToHashtags = noteHashtags.items as Record<string, string[]>;

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

export function getNoteCategories(item: { url: string; linkedPages?: { path: string }[] }) {
  const magazineSlugs = urlToMagazineSlugs.get(item.url);
  if (magazineSlugs && magazineSlugs.length > 0) {
    return magazineSlugs;
  }

  const matched = new Set<string>();
  for (const page of item.linkedPages ?? []) {
    const category = categories.find((candidate) => page.path.includes(`/wiki/${candidate.slug}/`));
    if (category) {
      matched.add(category.slug);
    }
  }

  if (matched.size > 0) {
    return [...matched];
  }

  return [UNCATEGORIZED_SLUG];
}

export function getNoteTags(item: { url: string }) {
  return urlToHashtags[item.url] ?? [];
}

export function getNotePageItems(items: unknown[], page: number) {
  const start = (page - 1) * NOTE_PAGE_SIZE;
  return items.slice(start, start + NOTE_PAGE_SIZE);
}

export function getTotalNotePages(items: unknown[]) {
  return Math.max(1, Math.ceil(items.length / NOTE_PAGE_SIZE));
}
