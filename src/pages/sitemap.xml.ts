import { getCollection } from 'astro:content';
import { getEntryUpdatedTime, getWikiPath, isPublicEntry } from '../content/wiki';
import { getAnalysisEntries, getAnalysisPath } from '../content/analysis';
import { getDashboardDate } from '../dashboard-seo';
import { siteUpdates } from '../content/siteUpdates';

// ダッシュボードは本文末尾の「生成日時」を lastmod に使う（getDashboardDate）。
const dashboardFiles = import.meta.glob('../dashboards/**/*.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
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

// lastmod は「実際に更新された日」だけを出す。分からないページは省く（毎回ビルド日を入れると検索エンジンに無視される）。
function urlEntry(path: string, lastmod: Date | string | null | undefined, priority = '0.7') {
  return [
    '  <url>',
    `    <loc>${escapeXml(toAbsoluteUrl(path))}</loc>`,
    ...(lastmod ? [`    <lastmod>${formatDate(lastmod)}</lastmod>`] : []),
    '    <changefreq>weekly</changefreq>',
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

export async function GET() {
  const wikiEntries = (await getCollection('wiki')).filter(isPublicEntry);
  const urls = new Map<string, string>();

  const addUrl = (path: string, lastmod: Date | string | null | undefined, priority?: string) => {
    urls.set(path, urlEntry(path, lastmod, priority));
  };

  const analysisEntries = await getAnalysisEntries();
  const latestOf = (dates: (Date | string | null | undefined)[]) =>
    dates.filter((d): d is Date | string => Boolean(d)).map((d) => formatDate(d)).sort().at(-1) ?? null;
  const updatesOf = (type: string) => latestOf(siteUpdates.filter((u) => u.type === type).map((u) => u.date));
  const dashboardDates = Object.values(dashboardFiles).map((html) => getDashboardDate(html));
  const wikiLatest = latestOf(wikiEntries.map((entry) => getEntryUpdatedTime(entry)));

  addUrl('/', latestOf(siteUpdates.map((u) => u.date)), '1.0');
  addUrl('/latest/', wikiLatest, '0.6');
  addUrl('/reference/', latestOf(analysisEntries.map((e) => e.data.updated ?? e.data.date)), '0.8');
  addUrl('/data/', latestOf(dashboardDates), '0.8');
  addUrl('/suite/', updatesOf('Suite'), '0.7');
  // 以下は内容がほぼ変わらない固定ページ。lastmod は出さない。
  addUrl('/お問い合わせ/', null, '0.7');
  addUrl('/お問い合わせ/general/', null, '0.6');
  addUrl('/お問い合わせ/welfare/', null, '0.6');
  addUrl('/お問い合わせ/lab/', null, '0.6');
  addUrl('/運営者/', null, '0.5');
  addUrl('/privacy-policy/', null, '0.5');
  addUrl('/ツールに関する共通プライバシーポリシー/', null, '0.5');
  addUrl('/プライバシーポリシー-一覧/', null, '0.5');
  addUrl('/aulブランドにおけるapiツール開発の方向性（基本方針）/', null, '0.4');
  addUrl('/gemini-context-manager-プライバシーポリシー/', null, '0.4');
  addUrl('/why-what-how-prompt-builder-プライバシーポリシー/', null, '0.4');

  // カテゴリ・タグ・ページ送りの一覧は noindex（検索結果に出さない）にしているので、sitemapにも載せない。

  for (const [path, html] of Object.entries(dashboardFiles)) {
    const slug = path.replace('../dashboards/', '').replace(/\.html$/, '');
    addUrl(`/data/${slug}/`, getDashboardDate(html), '0.7');
  }

  for (const path of deepResearchFiles) {
    const slug = path.replace('../Deep-Research/', '').replace(/\.html$/, '');
    addUrl(`/reports/${slug}/`, null, '0.7');
  }

  for (const entry of analysisEntries) {
    addUrl(getAnalysisPath(entry), entry.data.updated ?? entry.data.date, '0.8');
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
