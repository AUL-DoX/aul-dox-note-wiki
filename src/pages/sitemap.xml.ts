import { getCollection } from 'astro:content';
import { getNoteIndexData } from '../content/noteIndex';
import { getEntryUpdatedTime, getWikiPath, isPublicEntry } from '../content/wiki';

const dashboardFiles = Object.keys(import.meta.glob('../dashboards/**/*.html'));
const deepResearchFiles = Object.keys(import.meta.glob('../Deep-Research/**/*.html'));

const SITE_URL = import.meta.env.SITE ?? 'https://aul-dox.jp';

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
  const { categories } = await getNoteIndexData();
  const urls = new Map<string, string>();

  const addUrl = (path: string, lastmod: Date | string, priority?: string) => {
    urls.set(path, urlEntry(path, lastmod, priority));
  };

  addUrl('/', today, '1.0');
  addUrl('/latest/', today, '0.6');
  addUrl('/notes/', today, '0.5');
  addUrl('/reference/', today, '0.8');
  addUrl('/data/', today, '0.8');
  addUrl('/suite/', today, '0.7');
  addUrl('/お問い合わせ/', today, '0.7');
  addUrl('/お問い合わせ/general/', today, '0.6');
  addUrl('/お問い合わせ/welfare/', today, '0.6');
  addUrl('/お問い合わせ/lab/', today, '0.6');
  addUrl('/運営者/', today, '0.5');
  addUrl('/privacy-policy/', today, '0.5');
  addUrl('/ツールに関する共通プライバシーポリシー/', today, '0.5');
  addUrl('/プライバシーポリシー-一覧/', today, '0.5');
  addUrl('/aulブランドにおけるapiツール開発の方向性（基本方針）/', today, '0.4');
  addUrl('/gemini-context-manager-プライバシーポリシー/', today, '0.4');
  addUrl('/why-what-how-prompt-builder-プライバシーポリシー/', today, '0.4');
  addUrl('/安全性について/', today, '0.4');

  // Keep indexable category landing pages, but omit low-value archive pagination and tag filters.
  for (const category of categories) {
    addUrl(`/categories/${category.slug}/`, today, '0.8');
  }

  for (const path of dashboardFiles) {
    const slug = path.replace('../dashboards/', '').replace(/\.html$/, '');
    addUrl(`/data/${slug}/`, today, '0.7');
  }

  for (const path of deepResearchFiles) {
    const slug = path.replace('../Deep-Research/', '').replace(/\.html$/, '');
    addUrl(`/reports/${slug}/`, today, '0.7');
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
