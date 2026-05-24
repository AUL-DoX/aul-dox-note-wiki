import { readFile, writeFile } from 'node:fs/promises';

const NOTE_ID = 'chic_wren6567';
const DATA_PATH = new URL('../data/note-links.json', import.meta.url);
const DEFAULT_STARTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function normalizeGoogleUrl(value) {
  try {
    const url = new URL(value);
    if (url.hostname === 'www.google.com' && url.pathname === '/url') {
      return url.searchParams.get('q') ?? value;
    }
  } catch {
    return value;
  }

  return value;
}

function extractNoteUrls(html) {
  const urls = new Set();
  const decoded = decodeHtml(html);
  const directPattern = new RegExp(`https://note\\.com/${NOTE_ID}/n/[A-Za-z0-9_-]+`, 'g');

  for (const match of decoded.matchAll(directPattern)) {
    urls.add(match[0]);
  }

  for (const match of decoded.matchAll(/href="([^"]+)"/g)) {
    const normalized = normalizeGoogleUrl(match[1]);
    const noteMatch = normalized.match(directPattern);
    if (noteMatch) {
      urls.add(noteMatch[0]);
    }
  }

  return [...urls];
}

function getTitleNearUrl(html, url) {
  const index = html.indexOf(url);
  if (index === -1) {
    return url;
  }

  const slice = html.slice(Math.max(0, index - 900), Math.min(html.length, index + 900));
  const titleMatch = slice.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
  if (!titleMatch) {
    return url;
  }

  return decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').trim()) || url;
}

async function fetchGoogleSearch(start) {
  const url = new URL('https://www.google.com/search');
  url.searchParams.set('q', `site:note.com/${NOTE_ID}/n/`);
  url.searchParams.set('start', String(start));
  url.searchParams.set('hl', 'ja');

  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Google search failed at start=${start}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

const existing = JSON.parse(await readFile(DATA_PATH, 'utf-8'));
const byUrl = new Map(existing.items.map((item) => [item.url, item]));
const args = process.argv.slice(2);
const htmlFiles = args.filter((arg) => arg.endsWith('.html') || arg.endsWith('.htm'));
const starts = args.length > 0 && htmlFiles.length === 0 ? args.map(Number) : DEFAULT_STARTS;
let found = 0;

async function mergeHtml(html, sourceLabel) {
  const urls = extractNoteUrls(html);
  found += urls.length;

  for (const url of urls) {
    if (!byUrl.has(url)) {
      byUrl.set(url, {
        title: getTitleNearUrl(html, url),
        url,
        published: '',
        description: `${sourceLabel}から取得したnote記事URLです。`,
        source: sourceLabel,
      });
    }
  }
}

if (htmlFiles.length > 0) {
  for (const file of htmlFiles) {
    await mergeHtml(await readFile(file, 'utf-8'), 'Google saved HTML');
  }
} else {
  for (const start of starts) {
    await mergeHtml(await fetchGoogleSearch(start), 'google');
  }
}

const items = [...byUrl.values()];

await writeFile(
  DATA_PATH,
  `${JSON.stringify(
    {
      ...existing,
      sources: [...new Set([existing.source, ...(existing.sources ?? []), 'Google site search'].filter(Boolean))],
      googleFetchedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2,
  )}\n`,
);

console.log(`Google search saw ${found} URLs. Merged total -> ${items.length} note links.`);
