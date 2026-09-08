import { getNoteIndexData, getNoteCategories, getNoteTags } from './noteIndex';
import { deepResearchTags, formatYearMonth, getCategoryLabel } from '../data-categories';
import titleOverrides from '../data-titles.json';

export type SearchSection = 'reference' | 'data' | 'deep-research' | 'suite';

export interface SearchItem {
  section: SearchSection;
  sectionLabel: string;
  title: string;
  description: string;
  href: string;
  searchText: string;
}

const dashboardModules = import.meta.glob('../dashboards/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const deepResearchModules = import.meta.glob('../Deep-Research/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const overrides = titleOverrides as Record<string, string>;

function extractTitle(html: string, fallback: string) {
  const match = html.match(/<h1>([\s\S]*?)<\/h1>/);
  return match ? match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : fallback;
}

function titleFor(key: string, html: string, fallback: string) {
  return overrides[key]?.trim() || extractTitle(html, fallback);
}

function deepResearchLabel(slug: string) {
  return deepResearchTags.find((tag) => tag.slug === slug)?.label ?? slug;
}

export async function getSearchIndex(): Promise<SearchItem[]> {
  const { allItems } = await getNoteIndexData();

  const referenceItems: SearchItem[] = allItems.map((item) => {
    const categories = getNoteCategories(item).join(' ');
    const tags = getNoteTags(item).join(' ');
    const description = item.description ?? '';
    return {
      section: 'reference',
      sectionLabel: 'Reference',
      title: item.title,
      description,
      href: item.url,
      searchText: `${item.title} ${description} ${categories} ${tags}`,
    };
  });

  const dataItems: SearchItem[] = Object.entries(dashboardModules).map(([path, html]) => {
    const rel = path.replace('../dashboards/', '').replace(/\.html$/, '');
    const category = rel.split('/')[0] ?? '';
    const title = titleFor(`dashboards/${rel}`, html, rel);
    const categoryLabel = getCategoryLabel(category);
    return {
      section: 'data',
      sectionLabel: 'Data',
      title,
      description: categoryLabel,
      href: `/data/${rel}/`,
      searchText: `${title} ${categoryLabel}`,
    };
  });

  const researchItems: SearchItem[] = Object.entries(deepResearchModules).map(([path, html]) => {
    const rel = path.replace('../Deep-Research/', '').replace(/\.html$/, '');
    const segments = rel.split('/');
    const tag = deepResearchLabel(segments[0] ?? '');
    const month = /^\d{4}-\d{2}$/.test(segments[1] ?? '') ? formatYearMonth(segments[1]) : '';
    const title = titleFor(`Deep-Research/${rel}`, html, rel);
    return {
      section: 'deep-research',
      sectionLabel: 'Deep Research',
      title,
      description: [tag, month].filter(Boolean).join(' / '),
      href: `/reports/${rel}/`,
      searchText: `${title} ${tag} ${month}`,
    };
  });

  const suiteItems: SearchItem[] = [
    {
      section: 'suite',
      sectionLabel: 'Suite',
      title: 'AUL Tools',
      description: 'AUL DoXのツールに関する記事・解説',
      href: '/wiki/aul-tools/tools-index/',
      searchText: 'AUL Tools AUL DoX ツール 記事 解説',
    },
    {
      section: 'suite',
      sectionLabel: 'Suite',
      title: 'GASツール',
      description: 'Google Apps Scriptによる業務改善の開発記録',
      href: '/wiki/gas-tools/gas-index/',
      searchText: 'GAS Google Apps Script 業務改善 開発記録 ツール',
    },
  ];

  return [...referenceItems, ...dataItems, ...researchItems, ...suiteItems];
}
