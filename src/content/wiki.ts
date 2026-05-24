import type { CollectionEntry } from 'astro:content';

export type WikiEntry = CollectionEntry<'wiki'>;

export function isPublicEntry(entry: WikiEntry) {
  return entry.data.draft !== true;
}

export function getEntryUpdatedTime(entry: WikiEntry) {
  return entry.data.updated ?? entry.data.date;
}

export function sortByUpdatedDesc(entries: WikiEntry[]) {
  return [...entries].sort((a, b) => getEntryUpdatedTime(b).getTime() - getEntryUpdatedTime(a).getTime());
}

export function getWikiPath(entry: WikiEntry) {
  const slug = entry.id.replace(/\.mdx?$/, '').replace(/\/index$/, '');
  return `/wiki/${slug}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
