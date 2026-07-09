import { mkdir, writeFile } from 'node:fs/promises';

const NOTE_ID = 'chic_wren6567';
const MAGAZINES_PAGE_URL = `https://note.com/${NOTE_ID}/magazines`;
const OUTPUT_PATH = new URL('../data/note-magazines.json', import.meta.url);
const USER_AGENT = 'AUL DoX note-wiki link collector';

function decodeXml(buffer) {
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  if (!utf8.includes('�')) {
    return utf8;
  }

  const shiftJis = new TextDecoder('shift_jis').decode(buffer);
  return shiftJis.includes('�') ? utf8 : shiftJis;
}

function getTagValue(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function parseFeedItems(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => {
    const item = match[1];
    return {
      title: getTagValue(item, 'title'),
      url: getTagValue(item, 'link'),
    };
  }).filter((entry) => entry.title && entry.url);
}

async function fetchMagazineKeys() {
  const response = await fetch(MAGAZINES_PAGE_URL, { headers: { 'user-agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${MAGAZINES_PAGE_URL}: ${response.status} ${response.statusText}`);
  }

  const html = decodeXml(await response.arrayBuffer());
  const pattern = new RegExp(`note\\.com/${NOTE_ID}/m/([a-z0-9]+)`, 'g');
  const keys = new Set();
  for (const match of html.matchAll(pattern)) {
    keys.add(match[1]);
  }

  return [...keys];
}

async function fetchMagazine(key) {
  const rssUrl = `https://note.com/${NOTE_ID}/m/${key}/rss`;
  const response = await fetch(rssUrl, { headers: { 'user-agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${rssUrl}: ${response.status} ${response.statusText}`);
  }

  const xml = decodeXml(await response.arrayBuffer());
  const channelTitle = getTagValue(xml, 'title').replace(/\s+/g, ' ').trim();
  const items = parseFeedItems(xml);

  return {
    key,
    title: channelTitle,
    url: `https://note.com/${NOTE_ID}/m/${key}`,
    articleUrls: items.map((item) => item.url),
  };
}

const keys = await fetchMagazineKeys();
console.log(`Found ${keys.length} magazine(s).`);

const magazines = [];
for (const key of keys) {
  const magazine = await fetchMagazine(key);
  magazines.push(magazine);
  console.log(`  ${magazine.title} (${magazine.articleUrls.length} article(s))`);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ fetchedAt: new Date().toISOString(), magazines }, null, 2)}\n`,
);

console.log(`Saved ${magazines.length} magazine(s) to data/note-magazines.json`);
