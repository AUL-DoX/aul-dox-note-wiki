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

const MAX_PAGES = 50;
const REQUEST_DELAY_MS = 200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

// note.comの公式API（ページネーション対応）でマガジンの全記事URLを取得する。
// 旧実装はRSS（/m/{key}/rss）を使っていたが、RSSは直近25件程度しか返さないため、
// 記事数の多いマガジンで収録記事を取りこぼしていた。
async function fetchMagazine(key) {
  let title = '';
  const articleUrls = [];
  const seen = new Set();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const apiUrl = `https://note.com/api/v1/magazines/${key}/notes?page=${page}`;
    const response = await fetch(apiUrl, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${apiUrl}: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const data = json?.data ?? {};
    if (!title && typeof data.name === 'string') {
      title = data.name.replace(/\s+/g, ' ').trim();
    }

    for (const note of data.notes ?? []) {
      if (note?.status !== 'published') continue;
      const urlname = note?.user?.urlname;
      const noteKey = note?.key;
      if (!urlname || !noteKey) continue;
      const url = `https://note.com/${urlname}/n/${noteKey}`;
      if (seen.has(url)) continue;
      seen.add(url);
      articleUrls.push(url);
    }

    if (!data.next_page) break;
    await sleep(REQUEST_DELAY_MS);
  }

  return {
    key,
    title,
    url: `https://note.com/${NOTE_ID}/m/${key}`,
    articleUrls,
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
