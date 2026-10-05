import { getCollection } from 'astro:content';
import { deepResearchTags, getCategoryLabel } from '../data-categories';
import titleOverrides from '../data-titles.json';
import { getEntryUpdatedTime, getWikiPath, isPublicEntry } from './wiki';

export interface LatestContentItem {
  type: 'reference' | 'data' | 'deep-research';
  typeLabel: string;
  category: string;
  title: string;
  description: string;
  href: string;
  date: Date;
  dateLabel: string;
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

function plainText(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractElement(html: string, selector: string) {
  const classPattern = new RegExp(
    `<(?:p|div)[^>]*class=["'][^"']*\\b${selector}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/(?:p|div)>`,
    'i',
  );
  return plainText(html.match(classPattern)?.[1] ?? '');
}

function extractTitle(html: string, fallback: string) {
  return plainText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? fallback);
}

function clipDescription(value: string, max = 150) {
  const text = plainText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/[、。\s]+$/u, '')}…`;
}

function dateInfo(source: string, html: string) {
  const full = `${source} ${html.slice(0, 8000)}`.match(
    /(?:更新\s*)?(20\d{2})[年\/-](\d{1,2})[月\/-](\d{1,2})日?/u,
  );
  if (full) {
    const date = new Date(Date.UTC(Number(full[1]), Number(full[2]) - 1, Number(full[3])));
    return { date, label: `${full[1]}.${full[2].padStart(2, '0')}.${full[3].padStart(2, '0')}` };
  }

  const dashedMonth = source.match(/(20\d{2})-(\d{2})/);
  const compactMonth = source.match(/(20\d{2})(\d{2})(?!\d)/);
  const japaneseMonth = html.slice(0, 8000).match(/(20\d{2})年(\d{1,2})月/u);
  const month = dashedMonth ?? compactMonth ?? japaneseMonth;
  if (!month) return undefined;

  const date = new Date(Date.UTC(Number(month[1]), Number(month[2]) - 1, 1));
  return { date, label: `${month[1]}.${month[2].padStart(2, '0')}` };
}

function fallbackDescription(html: string) {
  const keyPoints = html.match(/<h2[^>]*>\s*主要ポイント\s*<\/h2>([\s\S]*?)(?=<h2\b|$)/i)?.[1];
  const firstPoint = keyPoints?.match(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (firstPoint) {
    const detail = plainText(firstPoint[2]);
    return clipDescription(`${plainText(firstPoint[1])}。${detail}`);
  }

  const overviewSection = html.match(/<h2[^>]*>\s*概要\s*<\/h2>([\s\S]*?)(?=<h2\b|$)/i)?.[1];
  if (overviewSection) {
    const paragraphs = [...overviewSection.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => plainText(match[1]))
      .filter(Boolean);
    const overview = paragraphs.filter((paragraph) => !paragraph.startsWith('本サマリーは')).at(-1) ?? paragraphs[0];
    if (overview) return clipDescription(overview);
  }

  const summary = html.match(/<(?:div|p)[^>]*class=["'][^"']*\baul-summary\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i)?.[1];
  if (summary) return clipDescription(summary);

  const article = html.match(/<(?:main|article)[^>]*>([\s\S]*?)<\/(?:main|article)>/i)?.[1] ?? html;
  return clipDescription(article);
}

export async function getLatestContent(limit = 6): Promise<LatestContentItem[]> {
  const wikiEntries = (await getCollection('wiki')).filter(isPublicEntry);
  const referenceItems: LatestContentItem[] = wikiEntries.map((entry) => {
    const date = getEntryUpdatedTime(entry);
    return {
      type: 'reference',
      typeLabel: 'Reference',
      category: entry.data.category,
      title: entry.data.title,
      description: clipDescription(entry.data.description),
      href: getWikiPath(entry),
      date,
      dateLabel: new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date).replaceAll('/', '.'),
    };
  });

  const dataItems: LatestContentItem[] = Object.entries(dashboardModules).flatMap(([path, html]) => {
    const rel = path.replace('../dashboards/', '').replace(/\.html$/, '');
    const date = dateInfo(rel, html);
    if (!date) return [];
    const categorySlug = rel.split('/')[0] ?? '';
    const title = overrides[`dashboards/${rel}`]?.trim() || extractTitle(html, rel);
    const description = extractElement(html, 'lead') || fallbackDescription(html);
    return [{
      type: 'data' as const,
      typeLabel: 'Data',
      category: getCategoryLabel(categorySlug),
      title,
      description: clipDescription(description),
      href: `/data/${rel}/`,
      date: date.date,
      dateLabel: date.label,
    }];
  });

  const researchItems: LatestContentItem[] = Object.entries(deepResearchModules).flatMap(([path, html]) => {
    const rel = path.replace('../Deep-Research/', '').replace(/\.html$/, '');
    const date = dateInfo(rel, html);
    if (!date) return [];
    const categorySlug = rel.split('/')[0] ?? '';
    const category = deepResearchTags.find((item) => item.slug === categorySlug)?.label ?? categorySlug;
    const title = overrides[`Deep-Research/${rel}`]?.trim() || extractTitle(html, rel);
    const description = extractElement(html, 'lead') || fallbackDescription(html);
    return [{
      type: 'deep-research' as const,
      typeLabel: 'Deep Research',
      category,
      title,
      description: clipDescription(description),
      href: `/reports/${rel}/`,
      date: date.date,
      dateLabel: date.label,
    }];
  });

  return [...referenceItems, ...dataItems, ...researchItems]
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title, 'ja'))
    .slice(0, limit);
}
