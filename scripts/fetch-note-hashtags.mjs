import { mkdir, readFile, writeFile } from 'node:fs/promises';

const NOTE_LINKS_PATH = new URL('../data/note-links.json', import.meta.url);
const OUTPUT_PATH = new URL('../data/note-hashtags.json', import.meta.url);
const USER_AGENT = 'AUL DoX note-wiki link collector';
const REQUEST_DELAY_MS = 200;

function extractNoteKey(url) {
  const match = url.match(/\/n\/([a-z0-9]+)/i);
  return match ? match[1] : null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHashtags(noteKey) {
  const apiUrl = `https://note.com/api/v3/notes/${noteKey}`;
  const response = await fetch(apiUrl, { headers: { 'user-agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();
  const hashtagNotes = json?.data?.hashtag_notes ?? [];
  return hashtagNotes
    .map((entry) => entry?.hashtag?.name)
    .filter((name) => typeof name === 'string' && name.length > 0)
    .map((name) => name.replace(/^#/, ''));
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

const noteLinks = JSON.parse(stripBom(await readFile(NOTE_LINKS_PATH, 'utf-8')));
const urls = (noteLinks.items ?? []).map((item) => item.url).filter(Boolean);

console.log(`Fetching hashtags for ${urls.length} article(s)...`);

const items = {};
let succeeded = 0;
let failed = 0;

for (const url of urls) {
  const noteKey = extractNoteKey(url);
  if (!noteKey) {
    failed += 1;
    continue;
  }

  try {
    items[url] = await fetchHashtags(noteKey);
    succeeded += 1;
  } catch (error) {
    console.error(`  failed (${url}): ${error.message}`);
    failed += 1;
  }

  await sleep(REQUEST_DELAY_MS);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ fetchedAt: new Date().toISOString(), items }, null, 2)}\n`,
);

console.log(`Done. Succeeded=${succeeded} Failed=${failed}`);
