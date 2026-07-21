import { mkdir, readFile, writeFile } from 'node:fs/promises';

const NOTE_ID = 'chic_wren6567';
// note.comの公式API（ページネーション対応）。旧実装はRSS（/rss）を使っていたが、
// RSSは直近25件程度しか返さないため、古い記事を大量に取りこぼしていた。
const API_BASE = `https://note.com/api/v2/creators/${NOTE_ID}/contents?kind=note`;
const SOURCE_LABEL = 'https://note.com/api/v2/creators/contents';
const OUTPUT_PATH = new URL('../data/note-links.json', import.meta.url);
const USER_AGENT = 'AUL DoX note-wiki link collector';
const MAX_PAGES = 300;
const REQUEST_DELAY_MS = 120;
const DESCRIPTION_MAX = 140;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

// note本文（body）またはdescriptionから、検索・カード表示用の短い説明文を作る。
function buildDescription(note) {
  const raw = note.description || note.body || '';
  const text = decodeEntities(String(raw).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  if (text.length <= DESCRIPTION_MAX) return text;
  return `${text.slice(0, DESCRIPTION_MAX)}…`;
}

async function fetchAllNotes() {
  const items = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `${API_BASE}&page=${page}`;
    const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json())?.data ?? {};
    for (const note of data.contents ?? []) {
      if (note?.status !== 'published') continue;
      const urlname = note?.user?.urlname;
      const noteKey = note?.key;
      if (!urlname || !noteKey) continue;
      items.push({
        title: (note.name ?? '').trim(),
        url: `https://note.com/${urlname}/n/${noteKey}`,
        published: note.publishAt ?? '',
        description: buildDescription(note),
        source: 'rss',
      });
    }

    if (data.isLastPage) break;
    await sleep(REQUEST_DELAY_MS);
  }
  return items.filter((item) => item.title && item.url);
}

const apiItems = await fetchAllNotes();

let existing = {
  source: SOURCE_LABEL,
  sources: [],
  items: [],
};

try {
  existing = JSON.parse((await readFile(OUTPUT_PATH, 'utf-8')).replace(/^﻿/, ''));
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

const byUrl = new Map((existing.items ?? []).map((item) => [item.url, item]));
let added = 0;
let updated = 0;

for (const item of apiItems) {
  const current = byUrl.get(item.url);
  if (!current) {
    byUrl.set(item.url, item);
    added += 1;
    continue;
  }

  byUrl.set(item.url, {
    ...current,
    ...item,
    // 既存のdescriptionがあり、今回空なら既存を温存する。
    description: item.description || current.description || '',
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
      source: SOURCE_LABEL,
      sources: [...new Set([...(existing.sources ?? []), SOURCE_LABEL].filter(Boolean))],
      fetchedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2,
  )}\n`,
);

console.log(`Fetched ${apiItems.length} API links. Added=${added} Updated=${updated} Total=${items.length}`);
