import { getCollection } from 'astro:content';
import { getNoteCategories, getNoteIndexData, getNoteTags, getTotalNotePages } from '../content/noteIndex';
import { getEntryUpdatedTime, getWikiPath, isPublicEntry } from '../content/wiki';

const SITE_URL = 'https://aul-dox-note-wiki.vercel.app';

function toAbsoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function formatDate(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

function urlEntry(path: string, lastmod: Date | string, priority = '0.7') {
  return [
    '  <url>',
    `    <loc>${escapeXml(toAbsoluteUrl(path))}</loc>`,
    `    <lastmod>${formatDate(lastmod)}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

export async function GET() {
  const today = new Date();
  const wikiEntries = (await getCollection('wiki')).filter(isPublicEntry);
  const { allItems, categories, sortedTags } = await getNoteIndexData();
  const totalNotePages = getTotalNotePages(allItems);
  const urls = new Map<string, string>();

  const addUrl = (path: string, lastmod: Date | string, priority?: string) => {
    urls.set(path, urlEntry(path, lastmod, priority));
  };

  addUrl('/', today, '1.0');
  addUrl('/latest/', today, '0.6');
  addUrl('/notes/', today, '0.5');

  for (let page = 2; page <= totalNotePages; page += 1) {
    addUrl(`/page/${page}/`, today, '0.8');
  }

  for (const category of categories) {
    const categoryItems = allItems.filter((item) => getNoteCategories(item).includes(category.slug));
    const totalPages = getTotalNotePages(categoryItems);
    addUrl(`/categories/${category.slug}/`, today, '0.8');

    for (let page = 2; page <= totalPages; page += 1) {
      addUrl(`/categories/${category.slug}/page/${page}/`, today, '0.6');
    }
  }

  for (const [tag] of sortedTags) {
    const tagItems = allItems.filter((item) => getNoteTags(item).includes(tag));
    const totalPages = getTotalNotePages(tagItems);
    const tagPath = `/tags/${encodeURIComponent(tag)}/`;
    addUrl(tagPath, today, '0.7');

    for (let page = 2; page <= totalPages; page += 1) {
      addUrl(`${tagPath}page/${page}/`, today, '0.5');
    }
  }

  for (const entry of wikiEntries) {
    addUrl(getWikiPath(entry), getEntryUpdatedTime(entry), '0.7');
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.values(),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
