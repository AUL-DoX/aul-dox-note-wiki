import { categories } from './categories';
import { getNoteCategories, getNoteIndexData } from './noteIndex';

export interface LatestContentItem {
  typeLabel: 'Reference';
  category: string;
  title: string;
  description: string;
  href: string;
  date: Date;
  dateLabel: string;
}

function clipDescription(value: string, max = 150) {
  const text = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/[、。\s]+$/u, '')}…`;
}

export async function getLatestContent(limit = 9): Promise<LatestContentItem[]> {
  const { allItems } = await getNoteIndexData();

  return allItems.flatMap((item) => {
    if (!item.published || !item.url || !item.title) return [];
    const date = new Date(item.published);
    if (!Number.isFinite(date.getTime())) return [];

    const category = getNoteCategories(item)
      .map((slug) => categories.find((candidate) => candidate.slug === slug)?.title)
      .filter((title): title is string => Boolean(title))
      .join(' / ') || '記事';

    return [{
      typeLabel: 'Reference' as const,
      category,
      title: item.title,
      description: clipDescription(item.description ?? ''),
      href: item.url,
      date,
      dateLabel: new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date).replaceAll('/', '.'),
    }];
  })
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title, 'ja'))
    .slice(0, limit);
}
