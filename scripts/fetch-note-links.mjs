import { mkdir, readFile, writeFile } from 'node:fs/promises';

const NOTE_ID = 'chic_wren6567';
const FEED_URL = `https://note.com/${NOTE_ID}/rss`;
const OUTPUT_PATH = new URL('../data/note-links.json', import.meta.url);

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function stripCdata(value) {
  return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
}

function getTagValue(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeEntities(stripCdata(match[1].trim())) : '';
}

function parseItems(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const item = match[1];
      const title = getTagValue(item, 'title');
      const url = getTagValue(item, 'link');
      const published = getTagValue(item, 'pubDate');
      const description = getTagValue(item, 'description').replace(/<[^>]+>/g, '').trim();

      return {
        title,
        url,
        published,
        description,
      };
    })
    .filter((item) => item.title && item.url);
}

function decodeXml(buffer) {
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  if (!utf8.includes('\uFFFD')) {
    return utf8;
  }

  const shiftJis = new TextDecoder('shift_jis').decode(buffer);
  return shiftJis.includes('\uFFFD') ? utf8 : shiftJis;
}

const response = await fetch(FEED_URL, {
  headers: {
    'user-agent': 'AUL DoX note-wiki link collector',
  },
});

if (!response.ok) {
  throw new Error(`Failed to fetch ${FEED_URL}: ${response.status} ${response.statusText}`);
}

const xml = decodeXml(await response.arrayBuffer());
const rssItems = parseItems(xml).map((item) => ({ ...item, source: 'rss' }));
let existing = {
  source: FEED_URL,
  sources: [],
  items: [],
};

try {
  existing = JSON.parse((await readFile(OUTPUT_PATH, 'utf-8')).replace(/^\uFEFF/, ''));
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

const byUrl = new Map((existing.items ?? []).map((item) => [item.url, item]));
let added = 0;
let updated = 0;

for (const item of rssItems) {
  const current = byUrl.get(item.url);
  if (!current) {
    byUrl.set(item.url, item);
    added += 1;
    continue;
  }

  byUrl.set(item.url, {
    ...current,
    ...item,
    source: current.source === 'google' ? 'rss+google' : 'rss',
  });
  updated += 1;
}

const items = [...byUrl.values()];

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify(
    {
      ...existing,
      source: FEED_URL,
      sources: [...new Set([...(existing.sources ?? []), FEED_URL].filter(Boolean))],
      fetchedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2,
  )}\n`,
);

console.log(`Fetched ${rssItems.length} RSS links. Added=${added} Updated=${updated} Total=${items.length}`);
